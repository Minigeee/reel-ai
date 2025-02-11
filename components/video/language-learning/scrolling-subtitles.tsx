import { Text, View, ScrollView } from 'react-native';
import { useState, useMemo } from 'react';
import type { SubtitleSegment } from '../video-player';
import TinySegmenter from '~/lib/utils/ja-text-segmenter';

interface ScrollingSubtitlesProps {
  language: string;
  subtitles: SubtitleSegment[];
  currentTime: number;
  onWordPress: (word: string) => void;
}

export function ScrollingSubtitles({ language, subtitles, currentTime, onWordPress }: ScrollingSubtitlesProps) {
  const [scrollViewRef, setScrollViewRef] = useState<ScrollView | null>(null);

  // Find current subtitle index
  const currentIndex = subtitles.findIndex(
    segment => currentTime >= segment.start && currentTime <= segment.end
  );

  // Get previous, current, and next subtitles
  const visibleSubtitles = subtitles.slice(
    Math.max(0, currentIndex - 2),
    Math.min(subtitles.length, currentIndex + 2)
  );

  // Handle word press
  const handleWordPress = (word: string) => {
    onWordPress(word.toLowerCase().replace(/[.,!?]/g, ''));
  };

  // Memoize split words for each subtitle
  const splitSubtitles = useMemo(() => {
    if (language === 'ja') {
      const segmenter = new TinySegmenter();
      return visibleSubtitles.map(subtitle => ({
        ...subtitle,
        words: segmenter.segment(subtitle.text),
      }));
    }

    return visibleSubtitles.map(subtitle => ({
      ...subtitle,
      words: subtitle.text.split(' ')
    }));
  }, [visibleSubtitles]);

  return (
    <ScrollView
      ref={setScrollViewRef}
      className="flex-1 px-4 py-2"
      showsVerticalScrollIndicator={false}
    >
      {splitSubtitles.map((subtitle, index) => {
        const isCurrent = index === (currentIndex === 0 ? 0 : 2);
        return (
          <View key={subtitle.start} className="mb-4">
            <Text
              className={`text-xl ${isCurrent ? 'font-bold' : 'text-muted-foreground'}`}
            >
              {subtitle.words.map((word, wordIndex) => (
                <Text
                  key={wordIndex}
                  onPress={() => handleWordPress(word)}
                  className="active:opacity-70"
                >
                  {word}{language !== 'ja' && ' '}
                </Text>
              ))}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
