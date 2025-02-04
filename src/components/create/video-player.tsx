import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { PlayIcon } from 'lucide-react';
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
  const [showControls, setShowControls] = useState(true);
  const playerRef = useRef<ReactPlayer>(null);
  const hideTimeout = useRef<NodeJS.Timeout>();

  // Handle control visibility
  useEffect(() => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    if (isPlaying) {
      setShowControls(false);
    } else {
      hideTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 500);
    }

    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, [isPlaying]);

  const handleProgress = ({ played }: { played: number }) => {
    setProgress(played * 100);
  };

  const handleSliderChange = (value: number[]) => {
    const time = value[0] / 100;
    setProgress(value[0]);
    playerRef.current?.seekTo(time);
  };

  const handleVideoClick = () => {
    setShowControls(true);
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
        />
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
