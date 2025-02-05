import { useVideoPlayerStore } from '@/lib/stores/video-player-store';
import { clamp } from '@/lib/utils';
import { useGesture } from '@use-gesture/react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import debounce from 'lodash/debounce';
import { MinusIcon, PlusIcon } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../ui/button';

interface Thumbnail {
  time: number;
  src: string;
}

interface TimelineState {
  startTime: number;
  endTime: number;
  zoom: number;
  thumbnailCount: number;
}

interface TimelineEditorProps {
  videoUrl: string;
  onScrub: (time: number) => void;
  viewportWidth?: number; // Allow override of container width
  initialThumbnailCount?: number;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  videoUrl,
  onScrub,
  viewportWidth = 800, // Default width
  initialThumbnailCount = 5,
}) => {
  const duration = useVideoPlayerStore((state) => state.duration);
  const progress = useVideoPlayerStore((state) => state.progress);
  const frameCache = useVideoPlayerStore((state) => state.frameCache);
  const cacheFrame = useVideoPlayerStore((state) => state.cacheFrame);

  const [timelineState, setTimelineState] = useState<TimelineState>({
    startTime: 0,
    endTime: duration,
    zoom: 1,
    thumbnailCount: initialThumbnailCount,
  });

  // Set initial end time
  useEffect(() => {
    if (timelineState.endTime === 0 && duration > 0) {
      setTimelineState((prev) => ({ ...prev, endTime: duration }));
    }
  }, [duration]);

  // Add dragging state
  const [isDragging, setIsDragging] = useState(false);

  // Calculate thumbnail interval based on visible time range
  const thumbnailInterval = useMemo(() => {
    const visibleDuration = timelineState.endTime - timelineState.startTime;
    return visibleDuration / timelineState.thumbnailCount;
  }, [timelineState]);

  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pinch/zoom gesture handling
  const scale = useMotionValue(1);
  const x = useMotionValue(0);

  // Transform scale to timeline bounds
  const timelineScale = useTransform(scale, [0.5, 4], [0.5, 4]);

  // Add state for tracking thumbnail translation during scroll
  const [thumbnailTranslation, setThumbnailTranslation] = useState(0);

  // Add scroll handler for the slider
  const handleSliderDrag = useGesture(
    {
      onDrag: ({ delta: [dx], active }) => {
        if (!timelineRef.current) return;

        dx = -dx;
        const timelineWidth = timelineRef.current.offsetWidth;
        const visibleDuration = timelineState.endTime - timelineState.startTime;
        const pixelsPerSecond = timelineWidth / visibleDuration;

        // Calculate new start time based on drag delta
        const timeDelta = dx / pixelsPerSecond;
        const newStartTime = clamp(
          timelineState.startTime - timeDelta, // Negative because dragging right should move timeline left
          0,
          duration - visibleDuration
        );
        const newEndTime = newStartTime + visibleDuration;

        // Apply immediate visual translation while waiting for new thumbnails
        if (active && newStartTime > 0 && newEndTime < duration) {
          const translation = (dx / timelineWidth) * 100;
          setThumbnailTranslation((prev) => prev + translation);
        }

        // Update timeline state and generate new thumbnails
        setTimelineState((prev) => ({
          ...prev,
          startTime: newStartTime,
          endTime: newEndTime,
        }));
      },
      onDragEnd: () => {
        // Reset translation after new thumbnails are generated
        setThumbnailTranslation(0);
        generateThumbnailsForRange(
          timelineState.startTime,
          timelineState.endTime,
          timelineState.thumbnailCount
        );
      },
    },
    {
      drag: {
        rubberband: true,
      },
    }
  );

  // Calculate slider dimensions
  const sliderWidth = useMemo(() => {
    const visibleDuration = timelineState.endTime - timelineState.startTime;
    return (visibleDuration / duration) * 100;
  }, [timelineState.startTime, timelineState.endTime, duration]);

  const sliderPosition = useMemo(() => {
    return (timelineState.startTime / duration) * 100;
  }, [timelineState.startTime, duration]);

  const generateThumbnail = async (time: number): Promise<string> => {
    if (!videoRef.current || !canvasRef.current) return '';

    return new Promise((resolve) => {
      const video = videoRef.current!;
      const canvas = canvasRef.current!;

      const handleLoad = () => {
        video.currentTime = time;
      };

      const handleSeeked = () => {
        canvas.width = 160;
        canvas.height = 90;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);

        video.removeEventListener('loadeddata', handleLoad);
        video.removeEventListener('seeked', handleSeeked);

        resolve(thumbnailUrl);
      };

      video.addEventListener('loadeddata', handleLoad);
      video.addEventListener('seeked', handleSeeked);

      if (video.readyState >= 2) {
        handleLoad();
      }
    });
  };

  // Add these near the top of the component
  const [generationId, setGenerationId] = useState(0);
  const currentGenerationRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Update the generateThumbnailsForRange function
  const generateThumbnailsForRange = useMemo(
    () =>
      debounce(async (start: number, end: number, count: number) => {
        if (!videoUrl || duration <= 0) return;

        // Cancel any pending thumbnail generation
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        // Increment generation ID
        const thisGenerationId = generationId + 1;
        setGenerationId(thisGenerationId);
        currentGenerationRef.current = thisGenerationId;

        setIsGenerating(true);

        try {
          // Initialize video if needed
          if (!videoRef.current) {
            const video = document.createElement('video');
            video.src = videoUrl;
            video.crossOrigin = 'anonymous';
            video.preload = 'auto';
            video.style.display = 'none';
            videoRef.current = video;
            document.body.appendChild(video);
          }

          const newThumbnails: Thumbnail[] = [];
          const interval = (end - start) / count;

          for (let i = 0; i < count; i++) {
            // Check if this generation is still current
            if (currentGenerationRef.current !== thisGenerationId) {
              console.log('Thumbnail generation cancelled');
              return;
            }

            const time = start + i * interval;
            const roundedTime = Math.min(Math.round(time * 10) / 10, duration);

            if (!frameCache.has(roundedTime)) {
              const src = await generateThumbnail(roundedTime);
              // Verify again that this generation is still current
              if (currentGenerationRef.current !== thisGenerationId) return;
              cacheFrame(roundedTime, src);
              newThumbnails.push({ time: roundedTime, src });
            } else {
              newThumbnails.push({
                time: roundedTime,
                src: frameCache.get(roundedTime)!,
              });
            }
          }

          // Only update thumbnails if this is still the current generation
          if (currentGenerationRef.current === thisGenerationId) {
            setThumbnails(newThumbnails);
          }
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Error generating thumbnails:', error);
          }
        } finally {
          if (currentGenerationRef.current === thisGenerationId) {
            setIsGenerating(false);
          }
        }
      }, 300),
    [videoUrl, duration, frameCache, cacheFrame, generationId]
  );

  // Replace the gesture handlers with useGesture
  const bind = useGesture(
    {
      onDragStart: () => setIsDragging(true),
      onDragEnd: () => setIsDragging(false),
      onDrag: ({ event, active, movement: [x], xy: [pointX] }) => {
        if (!timelineRef.current || !active) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const percentage = (pointX - rect.left) / rect.width;
        const timeRange = timelineState.endTime - timelineState.startTime;
        const newTime = timelineState.startTime + timeRange * percentage;

        onScrub(Math.max(0, Math.min(newTime, duration)));
      },
      onPinch: ({ offset: [scale] }) => {
        handleZoomChange(scale);
      },
    },
    {
      drag: {
        from: () => [0, 0],
        bounds: timelineRef,
        rubberband: true,
      },
      pinch: {
        scaleBounds: { min: 0.5, max: 4 },
        rubberband: true,
      },
    }
  );

  // Update the handleZoomChange function to pass the correct count
  const handleZoomChange = (newScale: number) => {
    const newZoom = Math.min(Math.max(newScale, 0.5), 4);
    const visibleDuration = duration / newZoom;

    // Calculate new time bounds
    const centerTime =
      timelineState.startTime +
      (timelineState.endTime - timelineState.startTime) / 2;

    const newStartTime = Math.max(centerTime - visibleDuration / 2, 0);
    const newEndTime = Math.min(centerTime + visibleDuration / 2, duration);

    setTimelineState({
      startTime: newStartTime,
      endTime: newEndTime,
      zoom: newZoom,
      thumbnailCount: timelineState.thumbnailCount,
    });

    // Generate new thumbnails for the visible range
    generateThumbnailsForRange(
      newStartTime,
      newEndTime,
      timelineState.thumbnailCount
    );
  };

  // Initialize thumbnails on mount and when duration changes
  useEffect(() => {
    if (duration <= 0 || thumbnailInterval <= 0) return;

    generateThumbnailsForRange(
      timelineState.startTime,
      timelineState.endTime,
      timelineState.thumbnailCount
    );
  }, [
    videoUrl,
    timelineState.startTime,
    timelineState.endTime,
    timelineState.thumbnailCount,
  ]);

  // Update cleanup in useEffect
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (videoRef.current) {
        document.body.removeChild(videoRef.current);
        videoRef.current = undefined;
      }
    };
  }, []);

  // Add this effect after the other useEffect hooks
  useEffect(() => {
    // Convert progress percentage to time
    const currentTime = (progress / 100) * duration;
    
    // Check if current time is outside visible range
    if (currentTime < timelineState.startTime || currentTime > timelineState.endTime) {
      // Calculate visible duration
      const visibleDuration = timelineState.endTime - timelineState.startTime;
      
      // Calculate new start time, centered on current time if possible
      const idealStartTime = currentTime - visibleDuration / 2;
      const newStartTime = clamp(
        idealStartTime,
        0,
        Math.max(0, duration - visibleDuration)
      );
      const newEndTime = newStartTime + visibleDuration;

      // Update timeline state
      setTimelineState(prev => ({
        ...prev,
        startTime: newStartTime,
        endTime: newEndTime,
      }));

      // Generate new thumbnails for the updated range
      generateThumbnailsForRange(
        newStartTime,
        newEndTime,
        timelineState.thumbnailCount
      );
    }
  }, [progress, duration]);

  return (
    <div className='space-y-2'>
      {/* Scroll view slider */}
      {timelineState.zoom > 1 && (
        <div className='relative h-4 w-full rounded bg-muted mb-4'>
          <div
            className='absolute h-full cursor-grab rounded bg-primary/20 active:cursor-grabbing'
            style={{
              width: `${sliderWidth}%`,
              left: `${sliderPosition}%`,
            }}
            {...handleSliderDrag()}
          />
        </div>
      )}

      {/* Hidden canvas for thumbnail generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Thumbnail timeline */}
      <div
        ref={timelineRef}
        className='relative h-16 touch-none overflow-hidden rounded border bg-background'
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
        {...bind()}
      >
        <motion.div
          className='absolute flex h-full w-full'
          style={{
            x: thumbnailTranslation ? `${thumbnailTranslation}%` : x,
            scale: timelineScale,
            transformOrigin: 'left',
          }}
        >
          {thumbnails.map((thumb, index) => (
            <motion.div
              key={index}
              className='relative h-full'
              style={{
                width: `${viewportWidth / timelineState.thumbnailCount}px`,
                opacity: isGenerating ? 0.7 : 1,
              }}
            >
              <img
                src={thumb.src}
                alt={`Frame at ${thumb.time}s`}
                className='h-full w-full object-cover'
              />
              {isGenerating && (
                <div className='absolute inset-0 bg-background/20' />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Playhead indicator */}
        <motion.div
          className='absolute top-0 h-full w-0.5 bg-primary'
          style={{
            left: `${
              (((progress / 100) * duration - timelineState.startTime) /
                (timelineState.endTime - timelineState.startTime)) *
              100
            }%`,
          }}
        />
      </div>

      {/* Optional zoom controls */}
      <div className='flex items-center justify-center px-2'>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            disabled={timelineState.zoom <= 1}
            onClick={() => handleZoomChange(timelineState.zoom - 0.5)}
            className='w-8 h-8'
          >
            <MinusIcon className='h-3 w-3' />
          </Button>
          <span className='text-sm text-muted-foreground'>
            {(timelineState.zoom * 100).toFixed(0)}%
          </span>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => handleZoomChange(timelineState.zoom + 0.5)}
            className='w-8 h-8'
          >
            <PlusIcon className='h-3 w-3' />
          </Button>
        </div>
      </div>
    </div>
  );
};
