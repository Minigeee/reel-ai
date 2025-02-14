import { useQuery } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Button } from '~/components/ui/button';
import { useFlashcards } from '~/lib/hooks/use-flashcards';
import { supabase } from '~/lib/supabase';

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

interface DictionaryPopupProps {
  word: string;
  language?: string;
  onClose: () => void;
  position: { x: number; y: number };
}

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

export function DictionaryPopup({
  word,
  language = 'ja',
  onClose,
  position,
}: DictionaryPopupProps) {
  const { data: entry, isLoading, error } = useDictionaryQuery(word, language);
  const { addFlashcard, checkFlashcardExists } = useFlashcards(language);
  const [isInFlashcards, setIsInFlashcards] = useState(false);

  useEffect(() => {
    const checkExists = async () => {
      const exists = await checkFlashcardExists(word, language);
      setIsInFlashcards(exists);
    };
    checkExists();
  }, [word, language]);

  const handleAddToFlashcards = async () => {
    try {
      await addFlashcard.mutateAsync({ word, language });
      setIsInFlashcards(true);
    } catch (err) {
      // Word already exists or other error
      console.error('Failed to add flashcard:', err);
    }
  };

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      className='absolute rounded-lg bg-gray-800/95 p-4 shadow-lg'
      style={{
        top: position.y,
        left: position.x,
        maxWidth: 300,
        minWidth: 200,
      }}
    >
      <View className='mb-2 flex-row items-center justify-between gap-1 pr-0'>
        <Text className='text-lg font-bold text-white'>{word}</Text>
        <View className='flex-row gap-2'>
          {!isInFlashcards && (
            <Button
              size='icon'
              variant='ghost'
              onPress={handleAddToFlashcards}
              disabled={addFlashcard.isPending}
            >
              <Plus size={20} color='white' />
            </Button>
          )}
          <Button size='icon' variant='ghost' onPress={onClose}>
            <X size={20} color='white' />
          </Button>
        </View>
      </View>

      {(entry?.extra?.readings?.[0] || entry?.extra?.reading) && (
        <Text className='mb-2 text-gray-400'>
          {entry.extra.readings?.[0] || entry.extra.reading}
        </Text>
      )}

      {isLoading && (
        <Text className='text-gray-400'>Loading definition...</Text>
      )}

      {error && <Text className='text-red-400'>Failed to load definition</Text>}

      {isInFlashcards && (
        <Text className='mb-2 text-sm text-emerald-400'>
          Added to flashcards
        </Text>
      )}

      {entry && (
        <>
          <Text className='mb-1 text-sm text-gray-400'>
            {entry.part_of_speech}
          </Text>
          {entry.definitions.map((def, i) => (
            <Text key={i} className='mb-1 text-white'>
              {i + 1}. {def}
            </Text>
          ))}
        </>
      )}
    </Animated.View>
  );
}
