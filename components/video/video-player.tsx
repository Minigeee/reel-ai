import { useQuery } from '@tanstack/react-query';
import { VideoView, useVideoPlayer } from 'expo-video';
import {
  Heart,
  MessageCircle,
  MoreVertical,
  Play,
  Share2,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { GestureResponderEvent, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Button } from '~/components/ui/button';
import type { Tables } from '~/lib/database.types';
import { useLikeVideo } from '~/lib/hooks/use-like-video';
import { iconWithClassName } from '~/lib/icons/iconWithClassName';
import { supabase } from '~/lib/supabase';
import { CommentSheet } from './comments/comment-sheet';
import { DictionaryPopup } from './language-learning/dictionary-popup';
import { InteractiveSubtitles } from './language-learning/interactive-subtitles';
import { TabbedPanelSheet } from './language-learning/tabbed-panel-sheet';

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
  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(video.like_count ?? 0);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [showComments, setShowComments] = useState(false);
  const [showTabbedPanel, setShowTabbedPanel] = useState(false);
  const scale = useSharedValue(1);
  const progressWidth = useSharedValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragProgress = useSharedValue(0);

  const likeMutation = useLikeVideo();

  const player = useVideoPlayer(video.video_url, (player) => {
    player.timeUpdateEventInterval = 0.25;

    // Add progress listener
    player.addListener('timeUpdate', (event) => {
      if (!player.playing) return;
      const duration = player.duration || 1;
      setCurrentTime(event.currentTime);
      progressWidth.value = withTiming((event.currentTime / duration) * 100, {
        duration: 100,
      });
    });
  });

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
      (segment) => currentTime >= segment.start && currentTime <= segment.end
    );

    setCurrentSubtitle(currentSegment?.text ?? '');
  }, [currentTime, subtitles]);

  useEffect(() => {
    if (isActive) {
      player?.play();
      setIsPlaying(true);
    } else {
      player?.pause();
      setIsPlaying(false);
    }
  }, [isActive, player]);

  const handleLike = () => {
    scale.value = withSequence(
      withSpring(1.5, { duration: 50 }),
      withSpring(1, { stiffness: 500, damping: 10 })
    );

    setIsLiked((prev) => !prev);
    setLocalLikeCount((prev) => prev + (isLiked ? -1 : 1));

    likeMutation.mutate(video.id);
  };

  const handlePlaybackToggle = () => {
    setIsPlaying((prev) => !prev);
    if (isPlaying) player?.pause();
    else player?.play();
  };

  const handleSeek = (event: GestureResponderEvent) => {
    if (!player) return;
    setIsDragging(false);

    event.currentTarget.measure((x, y, width, height, pageX, pageY) => {
      const { locationX } = event.nativeEvent;
      const progress = locationX / width;
      const seekTime = progress * (player.duration || 0);
      console.log('seeking to', seekTime, progress, locationX, width);

      // Update progress bar immediately for better UX
      progressWidth.value = progress * 100;
      dragProgress.value = progress * 100;

      // Seek to the new time
      player.currentTime = seekTime;
      setCurrentTime(seekTime);
    });
  };

  const handleDrag = (event: GestureResponderEvent) => {
    if (!player) return;

    event.currentTarget.measure((x, y, width, height, pageX, pageY) => {
      const { locationX } = event.nativeEvent;
      const progress = Math.max(0, Math.min(1, locationX / width));
      dragProgress.value = progress * 100;
    });
  };

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${isDragging ? dragProgress.value : progressWidth.value}%`,
  }));

  const controlsStyle = useAnimatedStyle(() => ({
    opacity: withTiming(!isPlaying ? 1 : 0, { duration: 200 }),
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const [dictionaryPopup, setDictionaryPopup] = useState<{
    word: string;
    position: { x: number; y: number };
  } | null>(null);

  return (
    <>
      {/* Video Container - top 2/3 */}
      <View className='relative flex-1'>
        <VideoView
          player={player}
          style={{ flex: 1 }}
          contentFit='contain'
          nativeControls={false}
        />

        {/* Playback Overlay */}
        <Pressable
          onPress={handlePlaybackToggle}
          className='absolute inset-0 items-center justify-center'
        >
          <Animated.View style={controlsStyle}>
            {!isPlaying && (
              <View className='h-20 w-20 items-center justify-center rounded-full bg-black/60'>
                <Play size={32} color='white' />
              </View>
            )}
          </Animated.View>
        </Pressable>

        {/* Video Info Overlay */}
        <View className='absolute inset-0'>
          {/* Progress Bar */}
          <Pressable
            onTouchEnd={handleSeek}
            onTouchStart={() => setIsDragging(true)}
            onTouchMove={handleDrag}
            className='absolute bottom-1 left-0 right-0 h-6 justify-end'
          >
            <View className='h-1 w-full bg-white/30'>
              <Animated.View
                className='h-full bg-white'
                style={progressBarStyle}
              />
            </View>
          </Pressable>

          {/* Title and Username */}
          <View className='absolute bottom-8 left-6'>
            <Text className='text-base font-semibold text-white'>
              {video.title}
            </Text>
            <Text className='text-sm text-gray-200'>
              @{video.user.username}
            </Text>
          </View>

          {/* Action Buttons - Vertical Layout */}
          <View className='absolute bottom-8 right-4 items-center gap-2'>
            <View className='items-center'>
              <Animated.View style={animatedStyle}>
                <Button
                  variant='ghost'
                  onPress={handleLike}
                  className='h-12 w-12 active:bg-transparent'
                >
                  <Heart
                    size={28}
                    color={isLiked ? '#ef4444' : '#ffffff'}
                    fill={isLiked ? '#ef4444' : 'none'}
                  />
                </Button>
              </Animated.View>
              <Text className='text-sm text-white'>
                {formatCount(localLikeCount)}
              </Text>
            </View>

            <View className='items-center'>
              <Button
                variant='ghost'
                className='h-12 w-12'
                onPress={() => setShowComments(true)}
              >
                <MessageCircle size={28} color='#ffffff' />
              </Button>
              <Text className='text-sm text-white'>
                {formatCount(video.comment_count ?? 0)}
              </Text>
            </View>

            <View className='items-center'>
              <Button
                variant='ghost'
                className='h-12 w-12'
                onPress={() => setShowTabbedPanel(true)}
              >
                <MoreVertical size={28} color='#ffffff' />
              </Button>
            </View>
          </View>
        </View>

        {/* Standard video subtitles */}
        {currentSubtitle && (
          <View className='absolute bottom-40 left-0 right-0 items-center'>
            <InteractiveSubtitles
              text={currentSubtitle}
              language={video.language}
              onWordPress={(word) => {
                setDictionaryPopup({
                  word,
                  position: { x: 20, y: 40 },
                });
              }}
            />
          </View>
        )}
      </View>

      {/* Language Learning Panel Sheet */}
      <TabbedPanelSheet
        isOpen={showTabbedPanel}
        onClose={() => setShowTabbedPanel(false)}
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

      {/* Dictionary Popup */}
      {dictionaryPopup && (
        <DictionaryPopup
          word={dictionaryPopup.word}
          position={dictionaryPopup.position}
          onClose={() => setDictionaryPopup(null)}
        />
      )}

      {/* Comment Sheet */}
      <CommentSheet
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        videoId={video.id}
      />
    </>
  );
}
