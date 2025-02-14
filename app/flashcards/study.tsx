import { View, Text, useColorScheme, Dimensions, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import { useFlashcards } from '~/lib/hooks/use-flashcards';
import { useState, useCallback } from 'react';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolate,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '~/lib/supabase';
import { cn } from '~/lib/utils';

interface DictionaryEntry {
  id: string;
  word: string;
  language: string;
  definitions: string[];
  part_of_speech: string;
  extra?: {
    readings?: string[];
    reading?: string;
  };
  metadata?: Record<string, unknown>;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

const useDictionaryQuery = (word: string, language: string = 'ja') => {
  return useQuery({
    queryKey: ['dictionary', language, word],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dictionary')
        .select('*')
        .eq('language', language)
        .eq('word', word)
        .single();

      if (error) throw error;
      return data as DictionaryEntry;
    },
  });
};

export default function StudyDeckScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { language = 'ja' } = useLocalSearchParams<{ language: string }>();
  
  const { flashcards } = useFlashcards(language);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const currentWord = flashcards?.[currentIndex]?.word;
  const { data: dictionaryEntry } = useDictionaryQuery(currentWord ?? '', language);
  
  const rotate = useSharedValue(0);
  const translateX = useSharedValue(0);
  
  const goToNextCard = useCallback(() => {
    if (currentIndex < flashcards.length - 1) {
      translateX.value = withSpring(-SCREEN_WIDTH, {}, () => {
        runOnJS(setCurrentIndex)(currentIndex + 1);
        runOnJS(setIsFlipped)(false);
        translateX.value = 0;
      });
    }
  }, [currentIndex, flashcards.length]);

  const goToPrevCard = useCallback(() => {
    if (currentIndex > 0) {
      translateX.value = withSpring(SCREEN_WIDTH, {}, () => {
        runOnJS(setCurrentIndex)(currentIndex - 1);
        runOnJS(setIsFlipped)(false);
        translateX.value = 0;
      });
    }
  }, [currentIndex]);

  const flipCard = useCallback(() => {
    const newValue = isFlipped ? 0 : 180;
    rotate.value = withTiming(newValue, { duration: 300 });
    runOnJS(setIsFlipped)(!isFlipped);
  }, [isFlipped]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        if (e.translationX > 0 && currentIndex > 0) {
          runOnJS(goToPrevCard)();
        } else if (e.translationX < 0 && currentIndex < flashcards.length - 1) {
          runOnJS(goToNextCard)();
        } else {
          translateX.value = withSpring(0);
        }
      } else {
        translateX.value = withSpring(0);
      }
    });

  const frontStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(rotate.value, [0, 180], [0, 180]);
    const opacity = interpolate(rotate.value, [0, 90, 91, 180], [1, 0, 0, 0]);
    
    return {
      transform: [
        { translateX: translateX.value },
        { rotateY: `${rotateValue}deg` },
      ],
      opacity,
      backfaceVisibility: 'hidden' as const,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(rotate.value, [0, 180], [180, 360]);
    const opacity = interpolate(rotate.value, [0, 90, 91, 180], [0, 0, 1, 1]);
    
    return {
      transform: [
        { translateX: translateX.value },
        { rotateY: `${rotateValue}deg` },
      ],
      opacity,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backfaceVisibility: 'hidden' as const,
    };
  });

  if (!flashcards?.length) {
    return (
      <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} px-4 pt-16`}>
        <Button
          variant="ghost"
          className="mb-4 self-start"
          onPress={() => router.back()}
        >
          <View className="flex-row items-center gap-2">
            <ArrowLeft size={20} className={isDark ? 'text-white' : 'text-gray-900'} />
            <Text className={isDark ? 'text-white' : 'text-gray-900'}>Back to Deck</Text>
          </View>
        </Button>
        <View className="flex-1 items-center justify-center">
          <Text className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No flashcards found
          </Text>
          <Text className={`mt-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Add some flashcards to start studying!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} px-4 pt-16`}>
      <Button
        variant="ghost"
        className="mb-4 self-start"
        onPress={() => router.back()}
      >
        <View className="flex-row items-center">
          <ArrowLeft size={20} className={cn('mr-2', isDark ? 'text-white' : 'text-gray-900')} />
          <Text className={isDark ? 'text-white' : 'text-gray-900'}>Back to Deck</Text>
        </View>
      </Button>

      <View className="flex-1">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Card {currentIndex + 1} of {flashcards.length}
          </Text>
          <Button
            variant="ghost"
            onPress={flipCard}
          >
            <RotateCw size={20} className={isDark ? 'text-white' : 'text-gray-900'} />
          </Button>
        </View>

        <GestureDetector gesture={panGesture}>
          <View className="flex-1">
            <Animated.View 
              className={`flex-1 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
              style={[frontStyle]}
            >
              <Pressable 
                className="flex-1 items-center justify-center p-6"
                onPress={flipCard}
              >
                <Text className={`text-3xl font-medium text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentWord}
                </Text>
              </Pressable>
            </Animated.View>

            <Animated.View 
              className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
              style={[backStyle]}
            >
              <Pressable 
                className="flex-1 px-6 py-8"
                onPress={flipCard}
              >
                <Text className={`text-2xl font-medium text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentWord}
                </Text>
                {dictionaryEntry?.extra?.reading && (
                  <Text className={`text-lg text-center mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {dictionaryEntry.extra.reading}
                  </Text>
                )}
                {dictionaryEntry?.part_of_speech && (
                  <Text className={`mt-2 text-base italic ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {dictionaryEntry.part_of_speech}
                  </Text>
                )}
                {dictionaryEntry?.definitions?.map((definition, index) => (
                  <Text 
                    key={index}
                    className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                  >
                    {index + 1}. {definition}
                  </Text>
                ))}
              </Pressable>
            </Animated.View>
          </View>
        </GestureDetector>

        <View className="flex-row items-center justify-between py-8">
          <Button
            variant="ghost"
            onPress={goToPrevCard}
            disabled={currentIndex === 0}
            className={currentIndex === 0 ? 'opacity-50' : ''}
          >
            <ChevronLeft size={24} className={isDark ? 'text-white' : 'text-gray-900'} />
          </Button>
          <Button
            variant="ghost"
            onPress={goToNextCard}
            disabled={currentIndex === flashcards.length - 1}
            className={currentIndex === flashcards.length - 1 ? 'opacity-50' : ''}
          >
            <ChevronRight size={24} className={isDark ? 'text-white' : 'text-gray-900'} />
          </Button>
        </View>
      </View>
    </View>
  );
}
