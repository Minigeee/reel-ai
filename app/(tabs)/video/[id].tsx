import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Loader2, XIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { VideoPlayer } from '~/components/video/video-player';
import { iconWithClassName } from '~/lib/icons/iconWithClassName';
import { supabase } from '~/lib/supabase';

iconWithClassName(Loader2);
iconWithClassName(XIcon);
iconWithClassName(ArrowLeft);

export default function VideoPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const {
    data: video,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['videos', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(
          `
          *,
          user:users!videos_user_id_fkey(*)
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <Loader2 className='h-4 w-4 animate-spin' />
      </View>
    );
  }

  if (error || !video) {
    return (
      <View className='flex-1 flex-col items-center justify-center p-4'>
        <XIcon className='h-8 w-8' />
        <Text>Failed to load video</Text>
      </View>
    );
  }

  return (
    <View className='relative flex-1 bg-black'>
      <Stack.Screen options={{ headerShown: false }} />
      <VideoPlayer video={video} isActive={true} />
      <Button
        size='icon'
        variant='ghost'
        onPress={() => router.back()}
        className='absolute left-4 top-12'
      >
        <ArrowLeft className='h-4 w-4 text-white' />
      </Button>
    </View>
  );
}
