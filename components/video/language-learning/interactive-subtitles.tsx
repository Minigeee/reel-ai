import { useMemo } from 'react';
import { Text } from 'react-native';
import TinySegmenter from '~/lib/utils/ja-text-segmenter';

interface InteractiveSubtitlesProps {
  text: string;
  language: string;
  onWordPress: (word: string) => void;
}

export function InteractiveSubtitles({
  text,
  language,
  onWordPress,
}: InteractiveSubtitlesProps) {
  // Handle word press
  const handleWordPress = (word: string) => {
    onWordPress(word.toLowerCase().replace(/[.,!?]/g, ''));
  };

  // Split text into words based on language
  const words = useMemo(() => {
    if (language === 'ja') {
      const segmenter = new TinySegmenter();
      return segmenter.segment(text);
    }
    return text.split(' ');
  }, [text, language]);

  return (
    <Text className='max-w-[60vw] rounded-md bg-black/50 px-4 py-2 text-center text-xl text-white'>
      {words.map((word, wordIndex) => (
        <Text
          key={wordIndex}
          onPress={(e) => {
            e.stopPropagation();
            handleWordPress(word);
          }}
          className='active:opacity-70'
        >
          {word}
          {language !== 'ja' && ' '}
        </Text>
      ))}
    </Text>
  );
}
