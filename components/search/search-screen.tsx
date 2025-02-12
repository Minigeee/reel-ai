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
  RefreshControl,
} from 'react-native';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  useUserSearch,
  useVideoSearch,
} from '~/features/queries/use-search-queries';
import { useDebounce } from '~/hooks/use-debounce';
import type { Tables } from '~/lib/database.types';
import { iconWithClassName } from '~/lib/icons/iconWithClassName';
import { cn } from '~/lib/utils';

const tabs = [
  { id: 'videos', label: 'Videos' },
  { id: 'users', label: 'Users' },
] as const;

const languages = [
  { value: '', label: 'All Languages' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
];

const difficulties = [
  { value: '', label: 'All Levels' },
  { value: 'a1', label: 'Beginner (A1)' },
  { value: 'a2', label: 'Elementary (A2)' },
  { value: 'b1', label: 'Intermediate (B1)' },
  { value: 'b2', label: 'Upper Intermediate (B2)' },
  { value: 'c1', label: 'Advanced (C1)' },
  { value: 'c2', label: 'Mastery (C2)' },
];

type User = Tables<'users'>;

iconWithClassName(Search);

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
        className='h-12 w-12 rounded-full bg-muted'
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
  const router = useRouter();
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]['id']>('videos');
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<
    { label: string; value: string } | undefined
  >(undefined);
  const [difficulty, setDifficulty] = useState<
    { label: string; value: string } | undefined
  >(undefined);
  const debouncedQuery = useDebounce(searchQuery, 300);

  const {
    data: videoPages,
    fetchNextPage: fetchNextVideos,
    hasNextPage: hasMoreVideos,
    isLoading: isLoadingVideos,
    refetch: refetchVideos,
    isRefetching: isRefetchingVideos,
  } = useVideoSearch({
    query: debouncedQuery,
    language: language?.value,
    difficulty: difficulty?.value,
  });

  const {
    data: userPages,
    fetchNextPage: fetchNextUsers,
    hasNextPage: hasMoreUsers,
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
    isRefetching: isRefetchingUsers,
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
        <View className='flex-row items-center gap-3 rounded-lg bg-muted px-4 py-1'>
          <Search size={20} className='text-muted-foreground' />
          <TextInput
            className='flex-1 text-base text-foreground'
            placeholder='Search'
            placeholderTextColor='#666'
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        {activeTab === 'videos' && (
          <View className='mt-4 flex-row gap-3'>
            <View className='flex-1'>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder='Select language' />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem
                      key={lang.value}
                      label={lang.label}
                      value={lang.value}
                    >
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </View>
            <View className='flex-1'>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder='Select difficulty' />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((level) => (
                    <SelectItem
                      key={level.value}
                      label={level.label}
                      value={level.value}
                    >
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </View>
          </View>
        )}
      </View>

      <TabBar activeTab={activeTab} onTabPress={setActiveTab} />

      {activeTab === 'videos' ? (
        <FlatList
          data={videos}
          className='p-5'
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingVideos}
              onRefresh={refetchVideos}
              tintColor="#666"
            />
          }
          renderItem={({ item }) => (
            <Pressable
              className='my-2 rounded-lg border border-border bg-card overflow-hidden'
              onPress={() => router.push(`/(tabs)/video/${item.id}`)}
            >
              <Image
                source={{
                  uri: item.thumbnail_url ?? 'https://via.placeholder.com/320x180?text=No+Thumbnail',
                }}
                className='w-full h-44'
                resizeMode='cover'
              />
              <View className='p-4'>
                <Text className='text-base font-medium text-foreground'>
                  {item.title}
                </Text>
                <Text className='mt-1 text-sm text-muted-foreground'>
                  {item.description}
                </Text>
                <View className='mt-2 flex-row items-center gap-2'>
                  <Image
                    source={{
                      uri:
                        item.user.avatar_url ??
                        'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
                    }}
                    className='h-6 w-6 rounded-full'
                  />
                  <Text className='text-sm text-muted-foreground'>
                    {item.user.display_name ?? item.user.username}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text className='p-4 text-center text-muted-foreground'>
              {isLoadingVideos ? 'Loading...' : 'No videos found'}
            </Text>
          }
        />
      ) : (
        <FlatList
          key={1}
          numColumns={1}
          data={users}
          className='flex-1'
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingUsers}
              onRefresh={refetchUsers}
              tintColor="#666"
            />
          }
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
