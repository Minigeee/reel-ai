import { useUploadStore } from '@/lib/stores/upload-store';
import { supabase } from '@/lib/supabase';
import { readFile } from '@tauri-apps/plugin-fs';

interface VideoDetails {
  title: string;
  description?: string;
  tags?: string[];
  category?: string;
}

export async function uploadVideo(filePath: string, userId: string, details: VideoDetails) {
  const uploadStore = useUploadStore.getState();
  const uploadId = crypto.randomUUID();

  try {
    uploadStore.addUpload(uploadId, filePath);

    const ext = filePath.split('.').pop();
    const fileName = `${userId}/${uploadId}.${ext}`;

    // Map file extension to content type
    const contentTypes = {
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      m4v: 'video/x-m4v',
      webm: 'video/webm',
      ogg: 'video/ogg',
      mkv: 'video/x-matroska',
      avi: 'video/avi',
      mpeg: 'video/mpeg',
      '3gp': 'video/3gpp',
    };
    const contentType =
      contentTypes[ext as keyof typeof contentTypes] || `video/${ext}`;

    // Load file contents
    const fileContents = await readFile(filePath);

    // Upload file to Supabase storage
    const { error } = await supabase.storage
      .from('videos')
      .upload(fileName, fileContents, {
        contentType: contentType,
        metadata: {
          user_id: userId,
          file_name: filePath.split(/\/\\/).pop(),
        },
      });

    if (error) throw error;

    // Create video record in database with details
    const { error: dbError } = await supabase.from('videos').insert({
      id: uploadId,
      user_id: userId,
      video_url: fileName,
      title: details.title,
      description: details.description,
      tags: details.tags,
      category: details.category,
      duration: 60, // TODO: Will be updated after processing
      status: 'published',
    });
    
    if (dbError) throw dbError;

    uploadStore.setCompleted(uploadId);
    return uploadId;
  } catch (error: any) {
    uploadStore.setError(uploadId, error.message);
    console.error('error', error);
    throw error;
  }
}
