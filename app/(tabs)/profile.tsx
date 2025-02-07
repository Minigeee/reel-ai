import { Redirect } from 'expo-router';
import { Text, View } from 'react-native';
import { useAuth } from '../../lib/providers/auth-provider';
import { UserProfile } from '../../components/profile/user-profile';

export default function ProfileScreen() {
  const { user, isLoading } = useAuth();

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

  return <UserProfile userId={user.id} isEditable />;
}
