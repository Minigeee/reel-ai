import { MessageCircle, MoreVertical, ThumbsUp } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import type { Tables } from '~/lib/database.types';
import { useLikeComment } from '~/lib/hooks/use-like-comment';
import { iconWithClassName } from '~/lib/icons/iconWithClassName';

type Comment = Tables<'comments'> & {
  user: Tables<'users'>;
  replies?: Comment[];
};

interface CommentItemProps {
  comment: Comment;
  onReply?: () => void;
  isLiked?: boolean;
  level?: number;
}

iconWithClassName(ThumbsUp);
iconWithClassName(MessageCircle);
iconWithClassName(MoreVertical);

export function CommentItem({
  comment,
  onReply,
  isLiked: initialIsLiked = false,
  level = 0,
}: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [localLikeCount, setLocalLikeCount] = useState(comment.like_count ?? 0);
  const likeMutation = useLikeComment();

  const handleLike = useCallback(async () => {
    try {
      setIsLiked((prev) => !prev);
      setLocalLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

      await likeMutation.mutateAsync({
        commentId: comment.id,
        isLiked,
      });
    } catch (error) {
      // Revert on error
      setIsLiked((prev) => !prev);
      setLocalLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
      console.error('Error liking comment:', error);
    }
  }, [comment.id, isLiked, likeMutation]);

  return (
    <View className='gap-4 py-2'>
      <View className={`flex-row gap-3 ${level > 0 ? 'ml-8' : ''}`}>
        {/* Avatar placeholder - replace with actual avatar component */}
        <Image
          source={{
            uri:
              comment.user.avatar_url ??
              'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
          }}
          className='h-10 w-10 rounded-full bg-muted'
        />

        <View className='flex-1'>
          <View className='flex-row items-center gap-2'>
            <Text className='font-semibold'>@{comment.user.username}</Text>
            <Text className='text-xs text-gray-500'>
              {comment.created_at &&
                new Date(comment.created_at).toLocaleDateString()}
            </Text>
          </View>

          <Text className='mt-1'>{comment.content}</Text>

          <View className='mt-2 flex-row gap-4'>
            <TouchableOpacity
              className='flex-row items-center gap-1.5'
              onPress={handleLike}
            >
              <ThumbsUp
                size={16}
                className={isLiked ? 'text-blue-500' : 'text-gray-500'}
                fill={isLiked ? '#3b82f6' : 'none'}
              />
              <Text
                className={`text-sm ${isLiked ? 'text-blue-500' : 'text-gray-500'}`}
              >
                {localLikeCount > 0 ? localLikeCount : 'Like'}
              </Text>
            </TouchableOpacity>

            {onReply && (
              <TouchableOpacity
                className='flex-row items-center gap-1.5'
                onPress={onReply}
              >
                <MessageCircle size={16} className='text-gray-500' />
                <Text className='text-sm text-gray-500'>Reply</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity>
          <MoreVertical size={16} className='text-gray-500' />
        </TouchableOpacity>
      </View>

      {/* Display replies */}
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          isLiked={false}
          level={level + 1}
        />
      ))}
    </View>
  );
}
