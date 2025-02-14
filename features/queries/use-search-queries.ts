import { useInfiniteQuery } from '@tanstack/react-query';
import type { Database, Enums } from '~/lib/database.types';
import { supabase } from '~/lib/supabase';

type Video = Database['public']['Tables']['videos']['Row'];
type User = Database['public']['Tables']['users']['Row'];

interface SearchResult<T> {
  data: T[];
  nextPage: number | null;
}

interface VideoSearchFilters {
  query: string;
  language?: string;
  difficulty?: string;
}

const ITEMS_PER_PAGE = 20;

export const useVideoSearch = ({
  query,
  language,
  difficulty,
}: VideoSearchFilters) => {
  return useInfiniteQuery({
    queryKey: ['video-search', query, language, difficulty],
    queryFn: async ({ pageParam = 0 }) => {
      const start = pageParam * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      let queryBuilder = supabase
        .from('videos')
        .select(
          `
          *,
          user:users!videos_user_id_fkey(*)
        `
        )
        .order('created_at', { ascending: false })
        .range(start, end);

      if (query.length > 0) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      if (language) {
        queryBuilder = queryBuilder.eq('language', language);
      }

      if (difficulty) {
        queryBuilder = queryBuilder.eq(
          'difficulty',
          difficulty as Enums<'language_level'>
        );
      }

      const { data, error } = await queryBuilder;

      if (error || !data) {
        throw error ?? new Error('No data returned');
      }

      return {
        data: data as (Video & { user: User })[],
        nextPage: data.length === ITEMS_PER_PAGE ? pageParam + 1 : null,
      } as SearchResult<Video & { user: User }>;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};

export const useUserSearch = (query: string) => {
  return useInfiniteQuery({
    queryKey: ['user-search', query],
    queryFn: async ({ pageParam = 0 }) => {
      const start = pageParam * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      let queryBuilder = supabase
        .from('users')
        .select('*')
        .order('username', { ascending: true })
        .range(start, end);

      if (query.length > 0) {
        queryBuilder = queryBuilder.or(
          `username.ilike.%${query}%,display_name.ilike.%${query}%`
        );
      }

      const { data, error } = await queryBuilder;

      if (error || !data) {
        throw error ?? new Error('No data returned');
      }

      return {
        data: data as User[],
        nextPage: data.length === ITEMS_PER_PAGE ? pageParam + 1 : null,
      } as SearchResult<User>;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};
