import React from 'react'
import { View } from 'react-native'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Text } from '~/components/ui/text'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../lib/stores/auth-store'
import { useState } from 'react'

export function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) throw error
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ padding: 20, gap: 16 }}>
      <View>
        <Text id="emailLabel">Email</Text>
        <Input
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          aria-labelledby="emailLabel"
        />
      </View>
      
      <View>
        <Text id="passwordLabel">Password</Text>
        <Input
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          aria-labelledby="passwordLabel"
        />
      </View>

      {error && (
        <Text style={{ color: 'red' }}>{error}</Text>
      )}

      <View style={{ gap: 8 }}>
        <Button
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text>{loading ? 'Signing in...' : 'Sign In'}</Text>
        </Button>

        <Button
          onPress={handleSignUp}
          variant="secondary"
          disabled={loading}
        >
          <Text>{loading ? 'Signing up...' : 'Sign Up'}</Text>
        </Button>
      </View>
    </View>
  )
} 