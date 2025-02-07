import { View } from 'react-native';
import { AuthForm } from '~/components/auth/auth-form';
import { Text } from '~/components/ui/text';
import { useAuth } from '~/lib/providers/auth-provider';
import { Redirect } from 'expo-router';

export default function LoginPage() {
  const { user } = useAuth();

  // If user is already logged in, redirect to home
  if (user) {
    return <Redirect href="/" />;
  }

  return (
    <View className="flex-1 items-center justify-center p-4 bg-background">
      <View className="w-full max-w-sm">
        <Text className="text-2xl font-bold mb-8 text-center">Welcome to Reel AI</Text>
        <AuthForm />
      </View>
    </View>
  );
}
