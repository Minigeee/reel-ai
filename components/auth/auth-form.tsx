import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { supabase } from '../../lib/supabase';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      if (authData.user) {
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

  return (
    <View style={{ padding: 20, gap: 16 }}>
    <View>
      <Text id='usernameLabel'>Username</Text>
      <Input
        placeholder='Choose a username'
        value={username}
        onChangeText={setUsername}
        autoCapitalize='none'
        aria-labelledby='usernameLabel'
      />
    </View>
    
      <View>
        <Text id='emailLabel'>Email</Text>
        <Input
          placeholder='Enter your email'
          value={email}
          onChangeText={setEmail}
          autoCapitalize='none'
          keyboardType='email-address'
          aria-labelledby='emailLabel'
        />
      </View>

      <View>
        <Text id='passwordLabel'>Password</Text>
        <Input
          placeholder='Enter your password'
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          aria-labelledby='passwordLabel'
        />
      </View>

      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      <View style={{ gap: 8 }}>
        <Button onPress={handleSignIn} disabled={loading}>
          <Text>{loading ? 'Signing in...' : 'Sign In'}</Text>
        </Button>

        <Button onPress={handleSignUp} variant='secondary' disabled={loading}>
          <Text>{loading ? 'Signing up...' : 'Sign Up'}</Text>
        </Button>
      </View>
    </View>
  );
}
