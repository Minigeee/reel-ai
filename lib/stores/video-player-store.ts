import { create } from 'zustand';
import { VideoPlayer } from 'expo-video';

interface VideoPlayerState {
  player: VideoPlayer | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  setPlayer: (player: VideoPlayer | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  togglePlayback: () => void;
  seekTo: (progress: number) => void;
}

export const useVideoPlayerStore = create<VideoPlayerState>((set, get) => ({
  player: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  setPlayer: (player) => set({ player }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  togglePlayback: () => {
    const { player, isPlaying } = get();
    if (!player) return;
    
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }

    set({ isPlaying: !isPlaying });
  },
  seekTo: (progress) => {
    const { player, duration } = get();
    if (!player || duration === 0) return;
    
    player.currentTime = duration * progress;
  },
})); 