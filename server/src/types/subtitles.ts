export interface RequestPayload {
  video_id: string;
  video_url: string;
  language: string;
  description?: string;
}

export interface WhisperSegment {
  start: number;
  end: number;
  text: string;
}

export interface WhisperResponse {
  segments: WhisperSegment[];
}

export type SubtitleStatus = 'processing' | 'completed' | 'error';
