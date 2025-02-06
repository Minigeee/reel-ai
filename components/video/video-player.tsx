import { ResizeMode, Video } from 'expo-av';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Button } from '~/components/ui/button';
import type { Tables } from '~/lib/database.types';
import { getStorageUrl } from '~/lib/utils/get-storage-url';

interface VideoPlayerProps {
  video: Tables<'videos'> & {
    user: Tables<'users'>;
  };
  isActive?: boolean;
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}m`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

export function VideoPlayer({ video, isActive }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(video.like_count ?? 0);
  const videoRef = useRef<Video>(null);
  const hideTimeout = useRef<NodeJS.Timeout>();
  const scale = useSharedValue(1);

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

  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
      setShowControls(true);
    } else {
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleVideoPress = async () => {
    setShowControls(true);
    setIsPlaying(!isPlaying);
    if (isPlaying) {
      await videoRef.current?.pauseAsync();
    } else {
      await videoRef.current?.playAsync();
    }
  };

  const handleLike = () => {
    scale.value = withSequence(
      withSpring(1.5, { duration: 50 }),
      withSpring(1, { stiffness: 500, damping: 10 })
    );

    setIsLiked((prev) => !prev);
    setLocalLikeCount((prev) => prev + (isLiked ? -1 : 1));
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className='flex-1'>
      <Pressable onPress={handleVideoPress} className='flex-1'>
        <Video
          ref={videoRef}
          source={{ uri: video.video_url }}
          shouldPlay={isPlaying}
          isLooping
          style={{ flex: 1 }}
          resizeMode={ResizeMode.CONTAIN}
        />

        {showControls && !isPlaying && (
          <Animated.View
            className='absolute items-center justify-center rounded-full bg-black/50'
            style={{
              top: '50%',
              left: '50%',
              transform: [{ translateX: -25 }, { translateY: -25 }],
              width: 50,
              height: 50,
            }}
          >
            <View
              style={{
                width: 0,
                height: 0,
                borderLeftWidth: 20,
                borderLeftColor: 'white',
                borderTopWidth: 12,
                borderTopColor: 'transparent',
                borderBottomWidth: 12,
                borderBottomColor: 'transparent',
                marginLeft: 5,
              }}
            />
          </Animated.View>
        )}
      </Pressable>

      {/* Video Info Overlay */}
      <View className='absolute bottom-0 left-0 right-0 bg-black/60 p-4'>
        <Text className='font-semibold text-white'>{video.title}</Text>
        <Text className='text-sm text-white/80'>@{video.user.username}</Text>
        {video.description && (
          <Text className='mt-1 text-sm text-white/70'>
            {video.description}
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View className='absolute bottom-6 right-4 items-center space-y-4'>
        <View className='items-center space-y-1'>
          <Animated.View style={animatedStyle}>
            <Button
              variant='ghost'
              onPress={handleLike}
              className='active:bg-transparent'
            >
              <Heart
                size={24}
                color={isLiked ? '#ef4444' : 'white'}
                fill={isLiked ? '#ef4444' : 'transparent'}
              />
            </Button>
          </Animated.View>
          <Text className='text-xs text-white'>
            {formatCount(localLikeCount)}
          </Text>
        </View>

        <View className='items-center space-y-1'>
          <Button variant='ghost'>
            <MessageCircle size={24} color='white' />
          </Button>
          <Text className='text-xs text-white'>
            {formatCount(video.comment_count ?? 0)}
          </Text>
        </View>

        <View className='items-center space-y-1'>
          <Button variant='ghost'>
            <Share2 size={24} color='white' />
          </Button>
        </View>
      </View>
    </View>
  );
}
