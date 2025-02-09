import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '~/lib/supabase';

export function useLikeVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase.rpc('toggle_video_like', {
        video_id: videoId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate queries that might contain the updated video
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['user-videos'] });
    },
  });
}
