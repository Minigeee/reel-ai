import {
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Sheet } from '~/components/ui/sheet';
import type { Tables } from '~/lib/database.types';
import { useAuth } from '~/lib/providers/auth-provider';
import { supabase } from '~/lib/supabase';
import { CommentItem } from './comment-item';

type Comment = Tables<'comments'> & {
  user: Tables<'users'>;
  replies?: Comment[];
};

interface CommentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

export function CommentSheet({ isOpen, onClose, videoId }: CommentSheetProps) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', videoId],
    queryFn: async () => {
      // First fetch all comments for this video
      const { data: allComments, error } = await supabase
        .from('comments')
        .select(
          `
          *,
          user:users!comments_user_id_fkey(*)
        `
        )
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Organize comments into a hierarchy
      const commentMap = new Map<string, Comment>();
      const topLevelComments: Comment[] = [];

      allComments.forEach((comment: Comment) => {
        comment.replies = [];
        commentMap.set(comment.id, comment);
      });

      allComments.forEach((comment: Comment) => {
        if (comment.parent_id === null) {
          topLevelComments.push(comment);
        } else {
          const parentComment = commentMap.get(comment.parent_id);
          if (parentComment) {
            if (!parentComment.replies) parentComment.replies = [];
            parentComment.replies.push(comment);
          }
        }
      });

      console.log('top level', topLevelComments);
      return topLevelComments as Comment[];
    },
  });

  // Fetch liked comments for the current user
  const { data: likedComments } = useQuery({
    queryKey: ['comment_likes', videoId],
    queryFn: async () => {
      if (!user) return new Set<string>();

      const { data, error } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return new Set(data.map((like) => like.comment_id));
    },
    enabled: !!user,
  });

  const handleSubmit = useCallback(async () => {
    if (!comment.trim() || !user) return;

    try {
      const { error } = await supabase.from('comments').insert([
        {
          user_id: user.id,
          video_id: videoId,
          content: comment.trim(),
          parent_id: replyTo,
        },
      ]);

      if (error) throw error;

      setComment('');
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  }, [comment, videoId, replyTo, queryClient, user]);

  return (
    <Sheet isVisible={isOpen} onClose={onClose} snapPoints={['80%']}>
      <BottomSheetView className='flex-1'>
        <View className='border-b border-gray-200 px-4 py-2'>
          <Text className='text-lg font-bold'>Comments</Text>
        </View>

        <BottomSheetScrollView className='flex-1 p-4'>
          {isLoading ? (
            <View className='items-center py-8'>
              <ActivityIndicator />
            </View>
          ) : (
            comments?.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={() => setReplyTo(comment.id)}
                isLiked={likedComments?.has(comment.id)}
              />
            ))
          )}
        </BottomSheetScrollView>

        <View className='border-t border-gray-200 px-4 py-2'>
          {replyTo && (
            <View className='mb-2 flex-row items-center justify-between'>
              <Text className='text-sm text-gray-500'>Replying to comment</Text>
              <TouchableOpacity
                onPress={() => setReplyTo(null)}
                className='px-2 py-1'
              >
                <Text className='text-blue-500'>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className='flex-row items-center gap-2'>
            <BottomSheetTextInput
              className='flex-1 rounded-full bg-gray-100 px-4 py-2'
              placeholder='Add a comment...'
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity
              onPress={handleSubmit}
              className='h-10 w-10 items-center justify-center rounded-full bg-blue-500'
            >
              <Send size={20} color='white' />
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetView>
    </Sheet>
  );
}
