import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  useUserSearch,
  useVideoSearch,
} from '~/features/queries/use-search-queries';
import { useDebounce } from '~/hooks/use-debounce';
import type { Tables } from '~/lib/database.types';
import { cn } from '~/lib/utils';

const tabs = [
  { id: 'videos', label: 'Videos' },
  { id: 'users', label: 'Users' },
] as const;

type User = Tables<'users'>;

function TabBar({
  activeTab,
  onTabPress,
}: {
  activeTab: (typeof tabs)[number]['id'];
  onTabPress: (tab: (typeof tabs)[number]['id']) => void;
}) {
  return (
    <View className='flex-row border-b border-border'>
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => onTabPress(tab.id)}
          className={cn(
            'flex-1 px-4 py-3',
            activeTab === tab.id && 'border-b-2 border-primary'
          )}
        >
          <Text
            className={cn(
              'text-center text-base font-medium',
              activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function UserCard({ user }: { user: User }) {
  const router = useRouter();

  return (
    <Pressable
      className='m-2 flex-row items-center gap-3 rounded-lg border border-border bg-card p-4'
      onPress={() => router.push(`/(tabs)/profile/${user.id}`)}
    >
      <Image
        source={{
          uri:
            user.avatar_url ??
            'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
        }}
        className='h-12 w-12 rounded-full'
      />
      <View className='flex-1'>
        <Text className='text-base font-medium text-foreground'>
          {user.display_name ?? user.username}
        </Text>
        <Text className='text-sm text-muted-foreground'>@{user.username}</Text>
      </View>
    </Pressable>
  );
}

export function SearchScreen() {
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]['id']>('videos');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const {
    data: videoPages,
    fetchNextPage: fetchNextVideos,
    hasNextPage: hasMoreVideos,
    isLoading: isLoadingVideos,
  } = useVideoSearch(debouncedQuery);

  const {
    data: userPages,
    fetchNextPage: fetchNextUsers,
    hasNextPage: hasMoreUsers,
    isLoading: isLoadingUsers,
  } = useUserSearch(debouncedQuery);

  const videos = videoPages?.pages.flatMap((page) => page.data) ?? [];
  const users = userPages?.pages.flatMap((page) => page.data) ?? [];

  const loadMore = useCallback(() => {
    if (activeTab === 'videos' && hasMoreVideos) {
      fetchNextVideos();
    } else if (activeTab === 'users' && hasMoreUsers) {
      fetchNextUsers();
    }
  }, [activeTab, hasMoreVideos, hasMoreUsers, fetchNextVideos, fetchNextUsers]);

  return (
    <View className='flex-1 bg-background'>
      <View className='border-b border-border p-4'>
        <View className='flex-row items-center space-x-2 rounded-lg bg-muted px-3 py-2'>
          <Search size={20} className='text-foreground' />
          <TextInput
            className='flex-1 text-base text-foreground'
            placeholder='Search videos or users...'
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor='#666'
          />
        </View>
      </View>

      <TabBar activeTab={activeTab} onTabPress={setActiveTab} />

      {activeTab === 'videos' ? (
        <FlatList
          key={2}
          numColumns={2}
          data={videos}
          className='flex-1 p-2'
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            isLoadingVideos ? (
              <Text className='p-4 text-center text-muted-foreground'>
                Loading videos...
              </Text>
            ) : (
              <Text className='p-4 text-center text-muted-foreground'>
                No videos found
              </Text>
            )
          }
          renderItem={({ item }) => (
            <Pressable
              className='m-2 flex-1 overflow-hidden rounded-lg border border-border bg-card'
              style={{ maxWidth: '50%' }}
            >
              {item.thumbnail_url && (
                <Image
                  source={{ uri: item.thumbnail_url ?? undefined }}
                  className='aspect-square w-full'
                  resizeMode='cover'
                />
              )}
              {!item.thumbnail_url && (
                <View className='aspect-square w-full bg-black' />
              )}
              <View className='p-2'>
                <Text
                  className='text-sm font-medium text-foreground'
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <Text
                  className='text-xs text-muted-foreground'
                  numberOfLines={1}
                >
                  @{item.user.display_name ?? item.user.username}
                </Text>
              </View>
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          key={1}
          numColumns={1}
          data={users}
          className='flex-1'
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            isLoadingUsers ? (
              <Text className='p-4 text-center text-muted-foreground'>
                Loading users...
              </Text>
            ) : (
              <Text className='p-4 text-center text-muted-foreground'>
                No users found
              </Text>
            )
          }
          renderItem={({ item }) => <UserCard user={item} />}
        />
      )}
    </View>
  );
}
