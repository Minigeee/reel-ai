import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '~/lib/supabase';
import { useAuth } from '../providers/auth-provider';

interface Flashcard {
  id: string;
  user_id: string;
  word: string;
  language: string;
  created_at: string;
  last_reviewed_at: string | null;
  review_count: number;
}

export function useFlashcards(language: string = 'ja') {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const flashcardsQuery = useQuery({
    queryKey: ['flashcards', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('language', language)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Flashcard[];
    },
  });

  const checkFlashcardExists = async (word: string, language: string) => {
    const { data } = await supabase
      .from('flashcards')
      .select('id')
      .eq('word', word)
      .eq('language', language)
      .single();

    return !!data;
  };

  const addFlashcard = useMutation({
    mutationFn: async ({
      word,
      language,
    }: {
      word: string;
      language: string;
    }) => {
      if (!user) throw new Error('User not logged in');

      const exists = await checkFlashcardExists(word, language);
      if (exists) {
        throw new Error('Word already exists in flashcards');
      }

      const { data, error } = await supabase
        .from('flashcards')
        .insert([{ user_id: user.id, word, language }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', language] });
    },
  });

  const removeFlashcard = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('flashcards').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', language] });
    },
  });

  return {
    flashcards: flashcardsQuery.data ?? [],
    isLoading: flashcardsQuery.isLoading,
    error: flashcardsQuery.error,
    addFlashcard,
    removeFlashcard,
    checkFlashcardExists,
  };
}
