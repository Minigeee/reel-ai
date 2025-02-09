import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { iconWithClassName } from '~/lib/icons/iconWithClassName';
import { UserProfile } from '../../../components/profile/user-profile';
import { Text } from '../../../components/ui/text';
import { useUser } from '../../../lib/hooks/use-user';

iconWithClassName(ArrowLeft);

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: user, isLoading } = useUser(id);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className='flex-1'>
        <View className='flex-row items-center border-b border-border px-4 pt-16 pb-3'>
          <Button
            size='icon'
            variant='ghost'
            onPress={() => router.back()}
            className='mr-4'
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <Text className='text-lg font-semibold'>
            {isLoading ? 'Loading...' : user?.username}
          </Text>
        </View>
        <UserProfile userId={id} />
      </View>
    </>
  );
}
