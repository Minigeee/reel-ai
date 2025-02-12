import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ImageIcon } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { iconWithClassName } from '~/lib/icons/iconWithClassName';
import type { Tables } from '../../lib/database.types';
import { supabase } from '../../lib/supabase';

type Video = Tables<'videos'>;

interface VideoListProps {
  userId: string;
  onRefetch?: () => void;
}

iconWithClassName(ImageIcon);

export function VideoList({ userId, onRefetch }: VideoListProps) {
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const numColumns = 3;
  const spacing = 10;
  const itemSize = (width - spacing * (numColumns + 1)) / numColumns;

  const { data, isLoading, hasNextPage, fetchNextPage, refetch } = useInfiniteQuery({
    queryKey: ['user-videos', userId],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('videos')
        .select('id, title, thumbnail_url, view_count, like_count')
        .eq('user_id', userId)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(pageParam * 30, (pageParam + 1) * 30 - 1);

      if (error) throw error;
      return {
        pages: data || [],
        nextPage: pageParam + 1,
      };
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pages) return undefined;
      return lastPage.pages.length === 30 ? lastPage.nextPage : undefined;
    },
    initialPageParam: 0,
  });

  const flattenedData = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.pages || []);
  }, [data?.pages]);

  const renderItem = useCallback(
    ({ item }: { item: Video }) => {
      return (
        <TouchableOpacity
          onPress={() => router.push(`/video/${item.id}`)}
          className='relative flex items-center justify-center overflow-hidden rounded-md bg-muted'
          style={{ width: itemSize, height: itemSize }}
        >
          {item.thumbnail_url && (
            <Image
              source={{ uri: item.thumbnail_url }}
              className='h-full w-full'
              resizeMode='cover'
            />
          )}
          {!item.thumbnail_url && (
            <ImageIcon className='h-12 w-12 text-muted-foreground' />
          )}
        </TouchableOpacity>
      );
    },
    [itemSize, router]
  );

  const handleRefetch = useCallback(() => {
    onRefetch?.();
  }, [onRefetch, refetch]);

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  if (flattenedData.length === 0) {
    return (
      <View className='flex-1 items-center justify-center py-8'>
        <Text className='text-gray-500'>No videos yet</Text>
      </View>
    );
  }

  return (
    <View className='flex-1'>
      <FlashList
        data={flattenedData as Video[]}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        estimatedItemSize={itemSize}
        ItemSeparatorComponent={() => <View style={{ height: spacing }} />}
      />
    </View>
  );
}
