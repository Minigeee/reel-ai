import { create } from 'zustand';

interface VideoPlayerStore {
  isPlaying: boolean;
  progress: number; // represented as percentage (0-100)
  duration: number; // in seconds
  isLoading: boolean;
  frameCache: Map<number, string>;
  setIsPlaying: (playing: boolean) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setIsLoading: (loading: boolean) => void;
  cacheFrame: (time: number, frame: string) => void;
}

export const useVideoPlayerStore = create<VideoPlayerStore>((set, get) => ({
  isPlaying: false,
  progress: 0,
  duration: 0,
  isLoading: true,
  frameCache: new Map(),
  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setProgress: (progress: number) => set({ progress }),
  setDuration: (duration: number) => set({ duration }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  cacheFrame: (time: number, frame: string) => {
    const updatedCache = new Map(get().frameCache);
    updatedCache.set(time, frame);
    set({ frameCache: updatedCache });
  },
})); 