import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { supabase } from '../../lib/supabase';

interface AuthFormProps {
  defaultTab?: 'signin' | 'signup';
}

export function AuthForm({ defaultTab = 'signin' }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(defaultTab);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!username.trim()) {
        throw new Error('Username is required');
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
        }
      );

      if (signUpError) throw signUpError;

      if (authData.user && authData.user.email) {
        // Create a profile for the new user
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: authData.user.email,
          display_name: username,
          username: username,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authData.user.id}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw new Error('Failed to create user profile');
        }
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setError(null);
  };

  const handleTabChange = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    resetForm();
  };

  return (
    <View className='w-full'>
      <View className='mb-6 flex-row border-b border-border'>
        <Pressable
          onPress={() => handleTabChange('signin')}
          className={`flex-1 py-3 ${activeTab === 'signin' ? 'border-b-2 border-primary' : ''}`}
        >
          <Text
            className={`text-center ${activeTab === 'signin' ? 'font-medium text-primary' : 'text-muted-foreground'}`}
          >
            Sign In
          </Text>
        </Pressable>
        <Pressable
          onPress={() => handleTabChange('signup')}
          className={`flex-1 py-3 ${activeTab === 'signup' ? 'border-b-2 border-primary' : ''}`}
        >
          <Text
            className={`text-center ${activeTab === 'signup' ? 'font-medium text-primary' : 'text-muted-foreground'}`}
          >
            Sign Up
          </Text>
        </Pressable>
      </View>

      <View className='gap-4'>
        {activeTab === 'signup' && (
          <View>
            <Text className='mb-1.5 text-sm text-foreground' id='usernameLabel'>
              Username
            </Text>
            <Input
              placeholder='Choose a username'
              value={username}
              onChangeText={setUsername}
              autoCapitalize='none'
              aria-labelledby='usernameLabel'
              className='h-12'
            />
          </View>
        )}

        <View>
          <Text className='mb-1.5 text-sm text-foreground' id='emailLabel'>
            Email
          </Text>
          <Input
            placeholder='Enter your email'
            value={email}
            onChangeText={setEmail}
            autoCapitalize='none'
            keyboardType='email-address'
            aria-labelledby='emailLabel'
            className='h-12'
          />
        </View>

        <View>
          <Text className='mb-1.5 text-sm text-foreground' id='passwordLabel'>
            Password
          </Text>
          <Input
            placeholder='Enter your password'
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            aria-labelledby='passwordLabel'
            className='h-12'
          />
        </View>

        {error && <Text className='text-sm text-red-500'>{error}</Text>}

        <View className='mt-6'>
          {activeTab === 'signin' ? (
            <Button onPress={handleSignIn} disabled={loading} className='h-12'>
              <Text className='text-base'>
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </Button>
          ) : (
            <Button onPress={handleSignUp} disabled={loading} className='h-12'>
              <Text className='text-base'>
                {loading ? 'Signing up...' : 'Sign Up'}
              </Text>
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}
