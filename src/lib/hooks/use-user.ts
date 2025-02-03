import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../providers/auth-provider';
import { supabase } from '../supabase';

interface User {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

async function fetchUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as User;
}

export function useUser(userId?: string) {
  const { user: authUser } = useAuth();
  const targetUserId = userId || authUser?.id;

  return useQuery({
    queryKey: ['users', targetUserId],
    queryFn: () => fetchUser(targetUserId!),
    enabled: !!targetUserId, // Only run query if we have a userId
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

interface UpdateUserData {
  display_name?: string;
  avatar_url?: string;
  bio?: string;
}

async function updateUser(userId: string, data: UpdateUserData) {
  const { error } = await supabase.from('users').update(data).eq('id', userId);

  if (error) throw error;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();

  return useMutation({
    mutationFn: (data: UpdateUserData) => {
      if (!authUser?.id) throw new Error('Not authenticated');
      return updateUser(authUser.id, data);
    },
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['users', authUser?.id] });
    },
  });
}
