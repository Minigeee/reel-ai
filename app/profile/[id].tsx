import { useLocalSearchParams } from 'expo-router';
import { UserProfile } from '../../components/profile/user-profile';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <UserProfile userId={id} />;
}
