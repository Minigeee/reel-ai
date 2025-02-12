import { createClient, SupabaseClient } from '@supabase/supabase-js';
import express, { Request } from 'express';
import ffmpeg from 'fluent-ffmpeg';
import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';
import multer from 'multer';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  transcribeAudio,
  updateSubtitleStatus,
} from '../services/subtitles.js';

const router = express.Router();

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: tmpdir(),
  filename: (req, file, cb) => {
    cb(null, `upload-${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

async function processVideo(inputPath: string): Promise<string> {
  const outputPath = join(tmpdir(), `processed-${Date.now()}.mp4`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoBitrate(1000)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
}

async function extractAudio(videoPath: string): Promise<string> {
  const outputPath = join(tmpdir(), `audio-${Date.now()}.mp3`);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .toFormat('mp3')
      .audioBitrate('192k')
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .run();
  });
}

async function uploadToSupabase(
  supabase: SupabaseClient,
  filePath: string,
  bucket: string,
  path: string,
  videoInfo: {
    user_id: string;
    title: string;
    description?: string | null;
    language: string;
    duration: number;
    thumbnail: string;
  }
): Promise<string> {
  // Video content type
  const fname = filePath.split('/').pop() ?? 'video.mp4';
  const ext = fname.split('.').pop() ?? 'mp4';
  const mimeTypes: Record<string, string> = {
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    m4v: 'video/x-m4v',
    webm: 'video/webm',
    ogv: 'video/ogg',
    mkv: 'video/x-matroska',
    avi: 'video/avi',
    mpg: 'video/mpeg',
    mpeg: 'video/mpeg',
    '3gp': 'video/3gpp',
  };
  const contentType = mimeTypes[ext?.toLowerCase() ?? ''] || `video/${ext}`;

  console.log(
    'supabase uploading',
    filePath,
    'to',
    bucket,
    'as',
    path,
    'with content type',
    contentType
  );

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, createReadStream(filePath), {
      cacheControl: '3600',
      upsert: false,
      contentType,
      metadata: {
        original_name: fname,
      },
      duplex: 'half',
    });
  if (error) throw error;

  console.log('finished video upload');

  const thumbnailPath = path.replace(/\.[^/.]+$/, '.jpg');
  const { error: thumbnailError } = await supabase.storage
    .from('thumbnails')
    .upload(thumbnailPath, createReadStream(videoInfo.thumbnail), {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/jpeg',
      duplex: 'half',
    });
  if (thumbnailError) throw thumbnailError;

  console.log('finished thumbnail upload');

  // Get the public URL for the uploaded video and thumbnail
  const {
    data: { publicUrl: videoUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  const {
    data: { publicUrl: thumbnailUrl },
  } = supabase.storage.from('thumbnails').getPublicUrl(thumbnailPath);

  // Create video record
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .insert({
      title: videoInfo.title,
      description: videoInfo.description,
      video_url: videoUrl,
      user_id: videoInfo.user_id,
      duration: videoInfo.duration,
      status: 'published' as const,
      language: videoInfo.language,
      thumbnail_url: thumbnailUrl,
    })
    .select('id')
    .single();

  if (videoError) throw videoError;

  // Create subtitle record
  const { error: subtitleError } = await supabase.from('subtitles').insert({
    video_id: video.id,
    language: videoInfo.language,
    status: 'processing',
  });

  if (subtitleError) throw subtitleError;

  return video.id;
}

// Map to store upload statuses
const uploadStatuses = new Map<string, { status: string; details?: any }>();

// Helper function to update status
function sendStatusUpdate(uploadId: string, status: string, details?: any) {
  console.log('updating status', uploadId, status);
  uploadStatuses.set(uploadId, { status, details });
}

// Status endpoint for polling
router.get('/upload-status/:uploadId', (req, res) => {
  const { uploadId } = req.params;
  const status = uploadStatuses.get(uploadId);

  if (!status) {
    res.status(404).json({ error: 'Upload not found' });
    return;
  }

  res.json(status);

  // Clean up completed or errored uploads after 5 minutes
  if (status.status === 'completed' || status.status === 'error') {
    setTimeout(
      () => {
        uploadStatuses.delete(uploadId);
      },
      5 * 60 * 1000
    );
  }
});

// Route to handle video upload and processing
router.post(
  '/upload',
  upload.single('video'),
  async (req: Request, res: any) => {
    const uploadId = `upload-${Date.now()}`;

    try {
      const { title, description, language } = req.body;

      // Send immediate response with uploadId
      res.json({ success: true, uploadId });

      // Get auth user
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const token = req.headers.authorization?.split(' ')[1];
      const {
        data: { user },
      } = await supabase.auth.getUser(token);

      if (!req.file || !user || !title) {
        sendStatusUpdate(uploadId, 'error', 'Missing required fields');
        return;
      }

      sendStatusUpdate(uploadId, 'processing_video');
      const inputPath = req.file.path;
      const processedPath = await processVideo(inputPath);

      sendStatusUpdate(uploadId, 'generating_thumbnail');
      const thumbnailName = `thumbnail-${Date.now()}.jpg`;
      const thumbnailPath = join(tmpdir(), thumbnailName);
      await new Promise<void>((resolve, reject) => {
        ffmpeg(processedPath)
          .screenshots({
            timestamps: ['00:00:01'],
            filename: thumbnailName,
            folder: tmpdir(),
            size: '1280x720',
          })
          .on('end', () => resolve())
          .on('error', (err) => reject(err));
      });

      sendStatusUpdate(uploadId, 'getting_duration');
      const duration = await new Promise<number>((resolve, reject) => {
        ffmpeg.ffprobe(processedPath, (err, metadata) => {
          if (err) reject(err);
          const durationS = metadata.format.duration ?? 0;
          resolve(Math.round(durationS * 1000));
        });
      });

      const fileName = `${user.id}/${Date.now()}-${req.file.originalname}`;

      sendStatusUpdate(uploadId, 'uploading_to_storage');
      const videoId = await uploadToSupabase(
        supabase,
        processedPath,
        'videos',
        fileName,
        {
          user_id: user.id,
          title,
          description,
          duration,
          language,
          thumbnail: thumbnailPath,
        }
      );

      try {
        sendStatusUpdate(uploadId, 'extracting_audio');
        const audioPath = await extractAudio(processedPath);

        sendStatusUpdate(uploadId, 'transcribing');
        const transcription = await transcribeAudio(audioPath, description);

        sendStatusUpdate(uploadId, 'updating_subtitles');
        await updateSubtitleStatus(
          supabase,
          videoId,
          language,
          'completed',
          transcription.segments
        );

        sendStatusUpdate(uploadId, 'completed', { videoId });

        console.log('finishing processing');
        // Clean up temporary files
        await Promise.all([
          unlink(inputPath),
          unlink(processedPath),
          unlink(thumbnailPath),
        ]);
      } catch (error) {
        // Update subtitle status to failed
        await updateSubtitleStatus(
          supabase,
          videoId,
          language,
          'error',
          undefined,
          error instanceof Error ? error.message : 'Unknown error'
        );

        throw error;
      }
    } catch (error) {
      console.error('Error processing video:', error);
      sendStatusUpdate(
        uploadId,
        'error',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
);

export default router;
