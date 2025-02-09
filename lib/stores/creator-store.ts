import { create } from 'zustand';

interface VideoFile {
  uri: string;
  duration: number;
}

interface VideoDetails {
  title: string;
  description: string;
  language: {
    label: string;
    value: string;
  };
  difficulty?: {
    label: string;
    value: string;
  };
}

interface CreatorStore {
  videoFile: VideoFile | null;
  videoDetails: VideoDetails;
  setVideoFile: (file: VideoFile | null) => void;
  setVideoDetails: (details: Partial<VideoDetails>) => void;
  reset: () => void;
}

export const useCreatorStore = create<CreatorStore>((set) => ({
  videoFile: null,
  videoDetails: {
    title: '',
    description: '',
    language: {
      label: 'English',
      value: 'en',
    },
    difficulty: undefined,
  },
  setVideoFile: (file) => set({ videoFile: file }),
  setVideoDetails: (details) =>
    set((state) => ({
      videoDetails: { ...state.videoDetails, ...details },
    })),
  reset: () =>
    set({
      videoFile: null,
      videoDetails: {
        title: '',
        description: '',
        language: {
          label: 'English',
          value: 'en',
        },
        difficulty: undefined,
      },
    }),
}));
