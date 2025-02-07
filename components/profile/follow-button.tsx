import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../../lib/providers/auth-provider';
import { supabase } from '../../lib/supabase';

interface FollowButtonProps {
  userId: string;
}

export function FollowButton({ userId }: FollowButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: isFollowing, isLoading } = useQuery({
    queryKey: ['follows', user?.id, userId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data } = await supabase
        .from('follows')
        .select()
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id && user.id !== userId,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follows'] });
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user?.id)
        .eq('following_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follows'] });
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
    },
  });

  if (user?.id === userId || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <TouchableOpacity className="px-4 py-2 bg-gray-200 rounded-full" disabled>
        <ActivityIndicator size="small" />
      </TouchableOpacity>
    );
  }

  if (isFollowing) {
    return (
      <TouchableOpacity
        className="px-4 py-2 bg-gray-200 rounded-full"
        onPress={() => unfollowMutation.mutate()}
        disabled={unfollowMutation.isPending}
      >
        <Text className="font-semibold text-gray-800">
          {unfollowMutation.isPending ? 'Unfollowing...' : 'Following'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      className="px-4 py-2 bg-blue-500 rounded-full"
      onPress={() => followMutation.mutate()}
      disabled={followMutation.isPending}
    >
      <Text className="font-semibold text-white">
        {followMutation.isPending ? 'Following...' : 'Follow'}
      </Text>
    </TouchableOpacity>
  );
}
