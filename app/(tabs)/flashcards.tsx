import { router } from 'expo-router';
import { BookOpen, Search, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Text, TextInput, useColorScheme, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { useFlashcards } from '~/lib/hooks/use-flashcards';
import { iconWithClassName } from '~/lib/icons/iconWithClassName';

iconWithClassName(Trash2);

export default function FlashcardsScreen() {
  const colorScheme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<
    { label: string; value: string } | undefined
  >({ label: 'Japanese', value: 'ja' });
  const { flashcards, removeFlashcard, isLoading } = useFlashcards(
    selectedLanguage?.value ?? 'en'
  );

  // Filter flashcards based on search query
  const filteredFlashcards = useMemo(() => {
    if (!searchQuery.trim()) return flashcards;
    const query = searchQuery.toLowerCase();
    return flashcards.filter((card) => card.word.toLowerCase().includes(query));
  }, [flashcards, searchQuery]);

  // Group flashcards by language
  const languages = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' },
    { label: 'Portuguese', value: 'pt' },
    { label: 'Chinese', value: 'zh' },
    { label: 'Japanese', value: 'ja' },
    { label: 'Korean', value: 'ko' },
  ];

  const handleRemoveCard = async (id: string) => {
    try {
      await removeFlashcard.mutateAsync(id);
    } catch (err) {
      console.error('Failed to remove flashcard:', err);
    }
  };

  const handleStudyDeck = () => {
    // TODO: Implement study deck page
    router.push('/flashcards/study');
  };

  return (
    <View className='flex-1 bg-white px-4 pt-4 dark:bg-gray-900'>
      {/* Language Selector */}
      <View className='mb-4'>
        <Select
          value={selectedLanguage}
          onValueChange={(value) => setSelectedLanguage(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder='Select language' />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem
                key={lang.value}
                label={lang.label}
                value={lang.value}
              >
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </View>

      {/* Study Deck Button */}
      {filteredFlashcards.length > 0 && (
        <Button className='mb-4' onPress={handleStudyDeck}>
          <View className='flex-row items-center gap-2'>
            <BookOpen size={20} />
            <Text className='text-white dark:text-white'>
              Study Deck ({filteredFlashcards.length} cards)
            </Text>
          </View>
        </Button>
      )}

      <View className='mb-6 mt-3 border-b border-gray-200 dark:border-gray-700' />

      {/* Search Bar */}
      <View className='mb-4 flex-row items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-800'>
        <Search size={20} className='text-gray-500 dark:text-gray-400' />
        <TextInput
          className='flex-1 text-base text-gray-900 dark:text-white'
          placeholder='Search words...'
          placeholderTextColor={colorScheme === 'dark' ? 'gray' : '#666'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Flashcards List */}
      <ScrollView className='flex-1'>
        {isLoading ? (
          <Text className='text-center text-gray-600 dark:text-gray-400'>
            Loading flashcards...
          </Text>
        ) : filteredFlashcards.length === 0 ? (
          <Text className='text-center text-gray-600 dark:text-gray-400'>
            {searchQuery
              ? 'No matching flashcards found'
              : 'No flashcards added yet'}
          </Text>
        ) : (
          <View className='gap-2'>
            {filteredFlashcards.map((card) => (
              <View
                key={card.id}
                className='flex-row items-center justify-between rounded-lg bg-gray-100 p-4 dark:bg-gray-800'
              >
                <View>
                  <Text className='text-lg font-bold text-gray-900 dark:text-white'>
                    {card.word}
                  </Text>
                  <Text className='text-sm text-gray-600 dark:text-gray-400'>
                    Added {new Date(card.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Button
                  variant='ghost'
                  size='icon'
                  onPress={() => handleRemoveCard(card.id)}
                >
                  <Trash2
                    size={20}
                    className='text-gray-500 dark:text-gray-400'
                  />
                </Button>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
