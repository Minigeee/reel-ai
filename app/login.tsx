import { View } from 'react-native';
import { AuthForm } from '~/components/auth/auth-form';
import { Text } from '~/components/ui/text';
import { useAuth } from '~/lib/providers/auth-provider';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function LoginPage() {
  const { user } = useAuth();
  const { mode } = useLocalSearchParams<{ mode?: 'signin' | 'signup' }>();

  // If user is already logged in, redirect to home
  if (user) {
    return <Redirect href="/" />;
  }

  return (
    <View className="flex-1 items-center justify-center px-4 py-8 bg-background">
      <View className="w-full max-w-sm">
        <Text className="text-3xl font-bold mb-2 text-center">Welcome</Text>
        <Text className="text-muted-foreground text-center mb-8">Sign in to your account or create a new one</Text>
        <AuthForm defaultTab={mode || 'signin'} />
      </View>
    </View>
  );
}
