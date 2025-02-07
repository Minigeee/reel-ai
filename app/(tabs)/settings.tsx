import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useAuthStore } from '~/lib/stores/auth-store';
import { supabase } from '~/lib/supabase';

export default function SettingsScreen() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View className='flex-1 items-center justify-center'>
      <Text className='mb-8 text-lg'>Settings</Text>
      <Button variant='destructive' onPress={handleSignOut}>
        <Text className='font-semibold'>Sign Out</Text>
      </Button>
    </View>
  );
}
