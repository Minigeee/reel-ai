import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../providers/auth-provider';
import { supabase } from '../supabase';

export function useLikeComment() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      commentId,
      isLiked,
    }: {
      commentId: string;
      isLiked: boolean;
    }) => {
      if (isLiked) {
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId);

        if (error) throw error;
      } else {
        if (!user) throw new Error('User not authenticated');
        const { error } = await supabase.from('comment_likes').insert([
          {
            comment_id: commentId,
            user_id: user.id,
          },
        ]);

        if (error) throw error;
      }
    },
  });
}
