import { Button } from '@/components/ui/button';
import type { Tables } from '@/lib/database.types';
import { getStorageUrl } from '@/lib/utils/get-storage-url';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

// Import ReactPlayer dynamically to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

interface VideoPlayerProps {
  video: Tables<'videos'> & {
    user: Tables<'users'>;
  };
  isActive?: boolean;
}

function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}m`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

export function VideoPlayer({ video, isActive }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(video.like_count ?? 0);
  const playerRef = useRef<typeof ReactPlayer>(null);
  const hideTimeout = useRef<NodeJS.Timeout>();
  const videoUrl = getStorageUrl('videos', video.video_url);

  // Handle control visibility
  useEffect(() => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    if (isPlaying) {
      hideTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    } else {
      setShowControls(true);
    }

    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, [isPlaying]);

  // Automatically play the video when it becomes active and pause when inactive
  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
      setShowControls(true); // optionally ensure controls are visible on activation
    } else {
      setIsPlaying(false);
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    }
  }, [isActive]);

  const handleVideoClick = () => {
    setShowControls(true);
    setIsPlaying(!isPlaying);
    console.log('video clicked', isPlaying);
  };

  const handleLike = async () => {
    // Optimistic update
    setIsLiked((prev) => !prev);
    setLocalLikeCount((prev) => prev + (isLiked ? -1 : 1));

    try {
      // TODO: Implement actual like API call
      // const { error } = await supabase.rpc('toggle_video_like', { video_id: video.id });
      // if (error) throw error;
    } catch (error) {
      // Revert on error
      setIsLiked((prev) => !prev);
      setLocalLikeCount((prev) => prev + (isLiked ? 1 : -1));
      console.error('Failed to toggle like:', error);
    }
  };

  return (
    <div className='relative h-full w-full bg-black'>
      {/* Video Player */}
      <div className='h-full w-full'>
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          playing={isPlaying}
          loop
          playsinline
          width='100%'
          height='100%'
          style={{ objectFit: 'contain' }}
          config={{
            file: {
              attributes: {
                style: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                },
              },
            },
          }}
        />
      </div>

      {/* Play/Pause Overlay */}
      <div
        className='absolute inset-0 flex items-center justify-center'
        onClick={handleVideoClick}
      >
        {showControls && !isPlaying && (
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

      {/* Video Info Overlay */}
      <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4'>
        <h3 className='font-semibold text-white'>{video.title}</h3>
        <p className='text-sm text-white/80'>@{video.user.username}</p>
        {video.description && (
          <p className='mt-1 text-sm text-white/70'>{video.description}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className='absolute bottom-6 right-4 flex flex-col gap-4'>
        <div className='flex flex-col items-center gap-1'>
          <motion.button
            whileTap={{ scale: 0.8 }}
            className='rounded-md bg-black/20 p-1 hover:bg-black/40'
            onClick={handleLike}
          >
            <Heart
              className={`h-6 w-6 ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-white'
              }`}
            />
          </motion.button>
          <span className='text-sm text-white'>
            {formatCount(localLikeCount)}
          </span>
        </div>

        <div className='flex flex-col items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            className='rounded-full bg-black/20 p-1 hover:bg-black/40'
          >
            <MessageCircle className='h-6 w-6 text-white' />
          </Button>
          <span className='text-sm text-white'>
            {formatCount(video.comment_count ?? 0)}
          </span>
        </div>

        <div className='flex flex-col items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            className='rounded-full bg-black/20 hover:bg-black/40'
          >
            <Share2 className='h-6 w-6 text-white' />
          </Button>
        </div>
      </div>
    </div>
  );
}
