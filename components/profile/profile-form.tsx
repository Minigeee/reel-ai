import { useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { useUpdateUser, useUser } from '../../lib/hooks/use-user';
import { useAuth } from '../../lib/providers/auth-provider';

interface ProfileFormData {
  display_name: string;
  bio: string;
  avatar_url: string;
}

export function ProfileForm() {
  const { user: authUser } = useAuth();
  const { data: user, isLoading } = useUser();
  const updateUserMutation = useUpdateUser();

  const [formData, setFormData] = useState<ProfileFormData>({
    display_name: user?.display_name || '',
    bio: user?.bio || '',
    avatar_url:
      user?.avatar_url ||
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authUser?.id,
  });

  const handleSubmit = async () => {
    try {
      await updateUserMutation.mutateAsync({
        ...formData,
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  return (
    <View className='flex-1 p-4'>
      <View className='mb-6 items-center'>
        <Avatar
          className='h-24 w-24 overflow-hidden rounded-full'
          alt={user?.display_name ?? 'user avatar'}
        >
          <AvatarImage
            source={{ uri: formData.avatar_url }}
            className='h-full w-full'
          />
          <AvatarFallback>
            <Text className='text-2xl'>
              {user?.display_name?.[0]?.toUpperCase()}
            </Text>
          </AvatarFallback>
        </Avatar>
      </View>

      <View className='space-y-4'>
        <View>
          <Text className='mb-1 text-sm text-gray-600'>Display Name</Text>
          <TextInput
            className='rounded-lg border border-gray-300 p-2'
            value={formData.display_name}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, display_name: text }))
            }
            placeholder='Enter your display name'
          />
        </View>

        <View>
          <Text className='mb-1 text-sm text-gray-600'>Bio</Text>
          <TextInput
            className='rounded-lg border border-gray-300 p-2'
            value={formData.bio}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, bio: text }))
            }
            placeholder='Tell us about yourself'
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          className='items-center rounded-lg bg-blue-500 p-3'
          onPress={handleSubmit}
          disabled={updateUserMutation.isPending}
        >
          {updateUserMutation.isPending ? (
            <ActivityIndicator color='white' />
          ) : (
            <Text className='font-semibold text-white'>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
