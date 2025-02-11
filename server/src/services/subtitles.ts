import { SupabaseClient } from '@supabase/supabase-js';
import ffmpeg from 'fluent-ffmpeg';
import FormData from 'form-data';
import { createReadStream, createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import fetch from 'node-fetch';
import { tmpdir } from 'os';
import { join } from 'path';
import { pipeline } from 'stream/promises';
import OpenAI from 'openai';
import {
  SubtitleStatus,
  WhisperResponse,
  WhisperSegment,
} from '../types/subtitles.js';

export async function extractAudio(videoUrl: string): Promise<string> {
  try {
    // Create temporary file paths
    const tempDir = tmpdir();
    const inputPath = join(tempDir, `input-${Date.now()}.mp4`);
    const outputPath = join(tempDir, `output-${Date.now()}.mp3`);

    // Download video file
    const response = await fetch(videoUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch video: ${response.statusText}`);

    // Save video to temporary file
    await pipeline(response.body!, createWriteStream(inputPath));

    // Extract audio using fluent-ffmpeg
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('mp3')
        .audioBitrate('192k')
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(outputPath);
    });

    // Clean up input file
    await unlink(inputPath);

    // Return the path to the audio file
    return outputPath;
  } catch (error) {
    console.error('Error in extractAudio:', error);
    throw error;
  }
}

export async function transcribeAudio(
  audioPath: string
): Promise<WhisperResponse> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const response = await openai.audio.transcriptions.create({
      file: createReadStream(audioPath),
      model: 'whisper-1',
      response_format: 'verbose_json',
    });

    // Clean up the audio file after transcription
    await unlink(audioPath);

    return response as WhisperResponse;
  } catch (error) {
    // Clean up the audio file even if transcription fails
    await unlink(audioPath).catch(console.error);
    throw error;
  }
}

export async function updateSubtitleStatus(
  supabase: SupabaseClient,
  videoId: string,
  language: string,
  status: SubtitleStatus,
  segments?: WhisperSegment[],
  errorMessage?: string
) {
  const { error } = await supabase
    .from('subtitles')
    .update({
      status,
      error_message: errorMessage,
      segments,
      updated_at: new Date().toISOString(),
    })
    .eq('video_id', videoId)
    .eq('language', language);

  if (error) throw error;
}
