import { Slider } from '@/components/ui/slider';
import { useVideoPlayerStore } from '@/lib/stores/video-player-store';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { TimelineEditor } from '../editor/timeline-editor';

interface VideoPlayerProps {
  url: string;
  className?: string;
}

export function VideoPlayer({ url, className }: VideoPlayerProps) {
  // Use the store state instead of local state
  const isPlaying = useVideoPlayerStore((state) => state.isPlaying);
  const progress = useVideoPlayerStore((state) => state.progress);
  const duration = useVideoPlayerStore((state) => state.duration);
  const isLoading = useVideoPlayerStore((state) => state.isLoading);
  const setIsPlaying = useVideoPlayerStore((state) => state.setIsPlaying);
  const setProgress = useVideoPlayerStore((state) => state.setProgress);
  const setDuration = useVideoPlayerStore((state) => state.setDuration);
  const setIsLoading = useVideoPlayerStore((state) => state.setIsLoading);

  const playerRef = useRef<ReactPlayer>(null);

  // Add timeline visibility state
  const [showTimeline, setShowTimeline] = useState(true);

  const handleProgress = ({ played }: { played: number }) => {
    setProgress(played * 100);
  };

  const handleSliderChange = (value: number[]) => {
    // Calculate the target time in seconds based on current duration
    const time = (value[0] / 100) * duration;
    setProgress(value[0]);
    playerRef.current?.seekTo(time);
  };

  const handleVideoClick = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = (progress / 100) * duration;

  return (
    <div className={cn('mx-auto w-full max-w-md space-y-4', className)}>
      <div className='relative aspect-[9/16] overflow-hidden rounded-lg bg-black'>
        <ReactPlayer
          ref={playerRef}
          url={url}
          width='100%'
          height='100%'
          playing={isPlaying}
          onProgress={handleProgress}
          onDuration={(dur) => {
            setDuration(dur);
            setIsLoading(false);
          }}
          onBuffer={() => setIsLoading(true)}
          onBufferEnd={() => setIsLoading(false)}
          // TODO: Integrate video stream from Tauri backend if needed
          style={{ objectFit: 'contain' }}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
            <Loader2 className='h-8 w-8 animate-spin text-white' />
          </div>
        )}

        {/* Overlay controls */}
        <div
          className='absolute inset-0 flex items-center justify-center'
          onClick={handleVideoClick}
        >
          {!isPlaying && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className='rounded-full bg-black/50 p-4'
            >
              <svg
                className='h-12 w-12 text-white'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z'
                />
              </svg>
            </motion.div>
          )}
        </div>
      </div>

      {/* Timeline Section */}
      {showTimeline && (
        <div className="w-full border-t border-border pt-4">
          <TimelineEditor 
            videoUrl={url} 
            onScrub={(time) => {
              setProgress((time / duration) * 100);
              playerRef.current?.seekTo(time);
            }}
          />
        </div>
      )}

      {/* Progress controls - show only when timeline is hidden */}
      {!showTimeline && (
        <div className='space-y-2 px-2'>
          <Slider
            value={[progress]}
            onValueChange={handleSliderChange}
            max={100}
            step={0.1}
            className='w-full'
          />
          <div className='flex justify-between text-sm text-muted-foreground'>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Timeline toggle button */}
      {/* <button
        onClick={() => setShowTimeline(!showTimeline)}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        {showTimeline ? 'Hide Timeline' : 'Show Timeline'}
      </button> */}
    </div>
  );
}
