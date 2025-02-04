import type { Tables } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import { useInfiniteQuery } from '@tanstack/react-query';

const PAGE_SIZE = 10;

interface VideoWithUser extends Tables<'videos'> {
  user: Tables<'users'>;
}

export function useVideos() {
  return useInfiniteQuery<VideoWithUser[]>({
    queryKey: ['videos'],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const from = (pageParam as number) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('videos')
        .select(
          `
          *,
          user:users!videos_user_id_fkey(*)
        `
        )
        .range(from, to)
        .order('created_at', { ascending: false })
        .eq('status', 'published');

      if (error) throw error;

      return data as VideoWithUser[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
  });
}
