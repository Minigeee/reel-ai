import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Image, ScrollView, View, RefreshControl } from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { useUser } from '../../lib/hooks/use-user';
import { supabase } from '../../lib/supabase';
import { Text } from '../ui/text';
import { VideoList } from '../video/video-list';
import { FollowButton } from './follow-button';
import { useCallback } from 'react';

interface UserProfileProps {
  userId: string;
  isEditable?: boolean;
}

export function UserProfile({ userId, isEditable }: UserProfileProps) {
  const { data: user, isLoading: isLoadingUser, refetch: refetchUser, isRefetching: isRefetchingUser } = useUser(userId);

  const { 
    data: stats, 
    isLoading: isLoadingStats, 
    refetch: refetchStats,
    isRefetching: isRefetchingStats 
  } = useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      const [{ count: followers }, { count: following }, { count: videos }] =
        await Promise.all([
          supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', userId),
          supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', userId),
          supabase
            .from('videos')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId),
        ]);
      return {
        followers: followers || 0,
        following: following || 0,
        videos: videos || 0,
      };
    },
  });

  const handleRefresh = useCallback(() => {
    refetchUser();
    refetchStats();
  }, [refetchUser, refetchStats]);

  const isRefreshing = isRefetchingUser || isRefetchingStats;

  if (isLoadingUser || isLoadingStats) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  if (!user) {
    return (
      <View className='flex-1 items-center justify-center'>
        <Text>User not found</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className='flex-1'
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#666"
        />
      }
    >
      <View className='p-4'>
        {/* Header */}
        <View className='mb-6 flex-row items-center justify-between'>
          <View className='flex-1 flex-row items-center gap-4'>
            <Avatar
              className='h-20 w-20'
              alt={`${user.display_name || user.username}'s avatar`}
            >
              <AvatarImage source={{ uri: user.avatar_url ?? undefined }} />
              <AvatarFallback>
                <Text className='text-xl text-muted-foreground'>
                  {(user.display_name || user.username)
                    .slice(0, 2)
                    .toUpperCase()}
                </Text>
              </AvatarFallback>
            </Avatar>
            <View className='flex-1'>
              <Text className='text-xl font-bold text-foreground'>
                {user.display_name || user.username}
              </Text>
              <Text className='text-muted-foreground'>@{user.username}</Text>
            </View>
          </View>
          {!isEditable && <FollowButton userId={userId} />}
        </View>

        {/* Bio */}
        {user.bio && (
          <Text className='mb-6 text-base text-gray-700'>{user.bio}</Text>
        )}

        {/* Stats */}
        <View className='mb-8 flex-row rounded-lg bg-muted p-4'>
          <View className='flex-1 items-center'>
            <Text className='text-lg font-bold'>
              {stats?.videos}
            </Text>
            <Text className='text-sm text-muted-foreground'>Videos</Text>
          </View>
          <View className='flex-1 items-center'>
            <Text className='text-lg font-bold'>
              {stats?.followers}
            </Text>
            <Text className='text-sm text-muted-foreground'>Followers</Text>
          </View>
          <View className='flex-1 items-center'>
            <Text className='text-lg font-bold'>{stats?.following}</Text>
            <Text className='text-sm text-muted-foreground'>Following</Text>
          </View>
        </View>

        {/* Videos */}
        <View className='flex-1'>
          <Text className='mb-4 text-lg font-bold'>Videos</Text>
          <VideoList userId={userId} />
        </View>
      </View>
    </ScrollView>
  );
}
