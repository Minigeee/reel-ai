import { create } from 'zustand';

export interface CreatorState {
  step: number;
  videoFile: { path: string; url: string } | null;
  videoDetails: {
    title: string;
    description: string;
    category?: string;
    tags?: string[];
  };
  setStep: (step: number) => void;
  setVideoFile: (file: { path: string; url: string } | null) => void;
  setVideoDetails: (details: Partial<CreatorState['videoDetails']>) => void;
  reset: () => void;
}

export const useCreatorStore = create<CreatorState>((set) => ({
  step: 0,
  videoFile: null,
  videoDetails: {
    title: '',
    description: '',
    tags: [],
  },
  setStep: (step) => set({ step }),
  setVideoFile: (file) => set({ videoFile: file }),
  setVideoDetails: (details) =>
    set((state) => ({
      videoDetails: { ...state.videoDetails, ...details },
    })),
  reset: () =>
    set({
      step: 0,
      videoFile: null,
      videoDetails: { title: '', description: '', tags: [] },
    }),
})); 