import { Redirect, Stack, useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { UserProfile } from '../../components/profile/user-profile';
import { iconWithClassName } from '../../lib/icons/iconWithClassName';
import { useAuth } from '../../lib/providers/auth-provider';

iconWithClassName(Settings);

export default function ProfileScreen() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href='/login' />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/(tabs)/settings')}
              className='mr-4'
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Settings size={24} className='mr-2 text-foreground' />
            </Pressable>
          ),
        }}
      />
      <UserProfile userId={user.id} isEditable />
    </>
  );
}
