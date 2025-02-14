import { Redirect, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { AuthForm } from '~/components/auth/auth-form';
import { Text } from '~/components/ui/text';
import { useAuth } from '~/lib/providers/auth-provider';

export default function LoginPage() {
  const { user } = useAuth();
  const { mode } = useLocalSearchParams<{ mode?: 'signin' | 'signup' }>();

  // If user is already logged in, redirect to home
  if (user) {
    return <Redirect href='/' />;
  }

  return (
    <View className='flex-1 items-center justify-center bg-background px-4 py-8'>
      <View className='w-full max-w-sm'>
        <Text className='mb-2 text-center text-3xl font-bold'>Welcome</Text>
        <Text className='mb-8 text-center text-muted-foreground'>
          Sign in to your account or create a new one
        </Text>
        <AuthForm defaultTab={mode || 'signin'} />
      </View>
    </View>
  );
}
