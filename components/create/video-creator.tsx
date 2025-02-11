import Slider from '@react-native-community/slider';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Image, Play, Upload, WandSparkles, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useCreatorStore } from '~/lib/stores/creator-store';
import { useVideoPlayerStore } from '~/lib/stores/video-player-store';
import { FiltersSheet } from './filters-sheet';
import { SelectVideoSheet } from './select-video-sheet';
import { UploadSheet } from './upload-sheet';

interface VideoCreatorProps {
  onClose: () => void;
}

export function VideoCreator({ onClose }: VideoCreatorProps) {
  const videoFile = useCreatorStore((state) => state.videoFile);
  const {
    setPlayer,
    isPlaying,
    progress,
    togglePlayback,
    seekTo,
    setIsPlaying,
    setProgress,
  } = useVideoPlayerStore();

  const [showSelectSheet, setShowSelectSheet] = useState(false);
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);
  const [showUploadSheet, setShowUploadSheet] = useState(false);

  const player = useVideoPlayer(videoFile?.uri ?? null, (player) => {
    player.timeUpdateEventInterval = 0.25;

    // Add progress listener
    player.addListener('timeUpdate', (event) => {
      if (!player.playing) return;
      const duration = videoFile?.duration ?? 1;
      const progress =
        Math.round((event.currentTime / (duration / 1000)) * 100) / 100;
      setProgress(progress);
    });
  });

  useEffect(() => {
    setPlayer(player);

    return () => {
      setPlayer(null);
    };
  }, [player]);

  if (!videoFile) return null;

  return (
    <View style={styles.container}>
      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color='white' />
        </TouchableOpacity>
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            value={progress}
            onValueChange={seekTo}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor='#FFFFFF'
            maximumTrackTintColor='#FFFFFF50'
            thumbTintColor='#FFFFFF'
          />
        </View>
      </View>

      {/* Video View with Overlay */}
      <View style={styles.videoContainer}>
        <VideoView
          style={styles.video}
          player={player}
          contentFit='contain'
          nativeControls={false}
        />
        <Pressable style={styles.videoOverlay} onPress={togglePlayback}>
          {isPlaying ? null : (
            <View style={styles.playButton}>
              <Play size={48} color='white' />
            </View>
          )}
        </Pressable>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons} className='bg-black/50'>
        <TouchableOpacity
          onPress={() => setShowSelectSheet(true)}
          className='p-4'
        >
          <Image size={24} color='white' />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowFiltersSheet(true)}
          className='p-4'
        >
          <WandSparkles size={24} color='white' />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowUploadSheet(true)}
          className='p-4'
        >
          <Upload size={24} color='white' />
        </TouchableOpacity>
      </View>

      {/* Selection Sheet */}
      <SelectVideoSheet
        isVisible={showSelectSheet}
        onClose={() => setShowSelectSheet(false)}
      />

      {/* Filters Sheet */}
      <FiltersSheet
        isVisible={showFiltersSheet}
        onClose={() => setShowFiltersSheet(false)}
      />

      {/* Upload Sheet */}
      <UploadSheet
        isVisible={showUploadSheet}
        onClose={() => setShowUploadSheet(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  topControls: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  closeButton: {
    marginRight: 16,
  },
  sliderContainer: {
    flex: 1,
    marginRight: 16,
  },
  slider: {
    width: '100%',
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
    paddingVertical: 8,
  },
});
