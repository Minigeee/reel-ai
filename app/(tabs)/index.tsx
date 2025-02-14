import { FlashList } from '@shopify/flash-list';
import { Stack } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Dimensions, RefreshControl, View, ViewToken } from 'react-native';
import { VideoPlayer } from '~/components/video/video-player';
import { useVideos } from '~/lib/queries/use-videos';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 8;

export default function ReelsScreen() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useVideos();
  const [activeIndex, setActiveIndex] = useState(0);

  const allVideos = data?.pages.flat() ?? [];

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <Stack.Screen options={{ headerShown: false }} />

      <FlashList
        data={allVideos}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor='#fff'
          />
        }
        renderItem={({ item, index }) => (
          <View style={{ height: WINDOW_HEIGHT }}>
            <VideoPlayer video={item} isActive={index === activeIndex} />
          </View>
        )}
        estimatedItemSize={WINDOW_HEIGHT}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}
