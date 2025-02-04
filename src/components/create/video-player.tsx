import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  url: string;
  className?: string;
}

export function VideoPlayer({ url, className }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<ReactPlayer>(null);

  const handleProgress = ({ played }: { played: number }) => {
    setProgress(played * 100);
  };

  const handleSliderChange = (value: number[]) => {
    const time = value[0] / 100;
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
          onDuration={setDuration}
          style={{ objectFit: 'contain' }}
        />

        {/* Overlay controls */}
        <div
          className='absolute inset-0 flex items-center justify-center'
          onClick={handleVideoClick}
        >
          {!isPlaying && (
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

      {/* Progress controls */}
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
    </div>
  );
}
