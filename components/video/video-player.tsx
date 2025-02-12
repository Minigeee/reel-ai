import { ResizeMode, Video } from 'expo-av';
import { Heart, MessageCircle, MoreVertical, Play, Share2 } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Button } from '~/components/ui/button';
import type { Tables } from '~/lib/database.types';
import { useLikeVideo } from '~/lib/hooks/use-like-video';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '~/lib/supabase';
import { TabbedPanel } from './language-learning/tabbed-panel';
import { DictionaryPopup } from './language-learning/dictionary-popup';
import { DescriptionSheet } from './language-learning/description-sheet';
import { iconWithClassName } from '~/lib/icons/iconWithClassName';

iconWithClassName(Heart);
iconWithClassName(MessageCircle);
iconWithClassName(Share2);
iconWithClassName(MoreVertical);

interface VideoPlayerProps {
  video: Tables<'videos'> & {
    user: Tables<'users'>;
  };
  isActive?: boolean;
}

interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
}

export type { SubtitleSegment };

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
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const videoRef = useRef<Video>(null);
  const hideTimeout = useRef<NodeJS.Timeout>();
  const scale = useSharedValue(1);

  const likeMutation = useLikeVideo();

  // Fetch subtitles for the video
  const { data: subtitles } = useQuery({
    queryKey: ['subtitles', video.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subtitles')
        .select('*')
        .eq('video_id', video.id)
        .eq('status', 'completed')
        .single();

      if (error) throw error;
      return data?.segments as SubtitleSegment[] | null;
    },
  });

  // Update current subtitle based on video time
  useEffect(() => {
    if (!subtitles) return;

    const currentSegment = subtitles.find(
      segment => currentTime >= segment.start && currentTime <= segment.end
    );

    setCurrentSubtitle(currentSegment?.text ?? '');
  }, [currentTime, subtitles]);

  // Handle video playback status updates
  const onPlaybackStatusUpdate = (status: any) => {
    // console.log('update', status.positionMillis)
    if (status?.isPlaying !== undefined) {
      setIsPlaying(status.isPlaying);
    }
    if (status?.positionMillis !== undefined) {
      setCurrentTime(status.positionMillis / 1000); // Convert to seconds
    }
  };

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

    likeMutation.mutate(video.id);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const [showDescription, setShowDescription] = useState(false);
  const [dictionaryPopup, setDictionaryPopup] = useState<{
    word: string;
    position: { x: number; y: number };
  } | null>(null);

  return (
    <View className='flex-1'>
      {/* Video Container - top 2/3 */}
      <View className="flex-[2]">
        <Pressable onPress={handleVideoPress} className="flex-1">
          <Video
            ref={videoRef}
            source={{ uri: video.video_url }}
            shouldPlay={isPlaying}
            isLooping
            style={{ flex: 1 }}
            resizeMode={ResizeMode.CONTAIN}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          />

          {/* Standard video subtitles */}
          {currentSubtitle && (
            <View className="absolute bottom-4 left-4 right-4 items-center">
              <Text className="text-white text-lg text-center bg-black/50 px-4 py-2 rounded-lg">
                {currentSubtitle}
              </Text>
            </View>
          )}

          {showControls && !isPlaying && (
            <Animated.View
              className="absolute items-center justify-center rounded-full bg-black/50"
              style={{
                top: '50%',
                left: '50%',
                transform: [{ translateX: -25 }, { translateY: -25 }],
                width: 50,
                height: 50,
              }}
            >
              <Play size={24} color="white" />
            </Animated.View>
          )}
        </Pressable>
      </View>

      {/* Video Info and Actions Bar */}
      <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <View className="px-4 py-3">
          {/* Title and Username */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-4">
              <Text className="font-semibold text-gray-900 dark:text-white text-base">{video.title}</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">@{video.user.username}</Text>
            </View>
            
            {/* Action Buttons */}
            <View className="flex-row items-center">
              <View className="flex-row items-center mr-2">
                <Animated.View style={animatedStyle}>
                  <Button
                    variant="ghost"
                    onPress={handleLike}
                    className="h-8 w-8 active:bg-transparent"
                  >
                    <Heart
                      size={20}
                      color={isLiked ? '#ef4444' : '#374151'}
                      fill={isLiked ? '#ef4444' : 'none'}
                      className="dark:text-white"
                    />
                  </Button>
                </Animated.View>
                <Text className="text-gray-900 dark:text-white text-sm">
                  {formatCount(localLikeCount)}
                </Text>
              </View>

              <View className="flex-row items-center mr-2">
                <Button variant="ghost" className="h-8 w-8">
                  <MessageCircle size={20} className="text-gray-900 dark:text-white" />
                </Button>
                <Text className="text-gray-900 dark:text-white text-sm">
                  {formatCount(video.comment_count ?? 0)}
                </Text>
              </View>

              <View className="items-center">
                <Button variant="ghost" className="h-8 w-8">
                  <Share2 size={20} className="text-gray-900 dark:text-white" />
                </Button>
              </View>

              <View className="items-center">
                <Button
                  variant="ghost"
                  className="h-8 w-8"
                  onPress={() => setShowDescription(true)}
                >
                  <MoreVertical size={20} className="text-gray-900 dark:text-white" />
                </Button>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Language Learning Panel - bottom 1/3 */}
      <View className="flex-1">
        <TabbedPanel
          language={video.language}
          subtitles={subtitles ?? []}
          currentTime={currentTime}
          videoId={video.id}
          videoTitle={video.title}
          videoDescription={video.description ?? undefined}
          onWordPress={(word) => {
            setDictionaryPopup({
              word,
              position: { x: 20, y: 40 },
            });
          }}
        />
      </View>

      {/* Dictionary Popup */}
      {dictionaryPopup && (
        <DictionaryPopup
          word={dictionaryPopup.word}
          position={dictionaryPopup.position}
          onClose={() => setDictionaryPopup(null)}
        />
      )}

      {/* Description Sheet */}
      <DescriptionSheet
        isOpen={showDescription}
        onClose={() => setShowDescription(false)}
        title={video.title}
        description={video.description ?? ''}
        username={video.user.username}
      />
    </View>
  );
}
