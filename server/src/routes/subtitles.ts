import { createClient } from '@supabase/supabase-js';
import { Router } from 'express';
import {
  extractAudio,
  transcribeAudio,
  updateSubtitleStatus,
} from '../services/subtitles.js';
import { RequestPayload } from '../types/subtitles.js';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const payload: RequestPayload = req.body;
    const { video_id, video_url, language, description } = payload;
    console.log('generating subtitles for', video_url);

    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update status to processing
    await updateSubtitleStatus(supabase, video_id, language, 'processing');

    // Extract audio from video and get the file path
    console.log('extracting audio');
    const audioPath = await extractAudio(video_url);

    // Transcribe audio using Whisper API
    console.log('transcribing audio');
    const whisperResponse = await transcribeAudio(audioPath, description);

    // Update subtitles with completed status and segments
    await updateSubtitleStatus(
      supabase,
      video_id,
      language,
      'completed',
      whisperResponse.segments
    );

    console.log('completed generating subtitles');
    res.json({ status: 'success', data: whisperResponse });
  } catch (error) {
    console.error('Error generating subtitles:', error);

    // If Supabase client is available, update status to error
    if (error instanceof Error) {
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await updateSubtitleStatus(
        supabase,
        req.body.video_id,
        req.body.language,
        'error',
        undefined,
        error.message
      );
    }

    res.status(500).json({
      status: 'error',
      message: `Error generating subtitles: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});

export default router;
