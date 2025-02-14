import { Redirect, Tabs } from 'expo-router';
import { Book, Home, Plus, Search, Settings, User } from 'lucide-react-native';
import { useAuth } from '~/lib/providers/auth-provider';
import { useColorScheme } from '~/lib/useColorScheme';

export default function TabsLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const { user, isLoading } = useAuth();

  // Wait for auth to be initialized
  if (isLoading) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('redirecting to logimn');
    return <Redirect href='/login' />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: isDarkColorScheme ? '#000' : '#fff',
          borderTopColor: isDarkColorScheme ? '#27272a' : '#e4e4e7',
        },
        tabBarActiveTintColor: isDarkColorScheme ? '#fff' : '#000',
        tabBarInactiveTintColor: isDarkColorScheme ? '#71717a' : '#71717a',
      }}
      initialRouteName='index'
      backBehavior='history'
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name='discover'
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name='create'
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size }) => <Plus color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name='flashcards'
        options={{
          title: 'Flashcards',
          tabBarIcon: ({ color, size }) => <Book color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: 'Settings',
          href: null,
        }}
      />
      <Tabs.Screen
        name='profile/[id]'
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name='video/[id]'
        options={{
          title: 'Video',
          href: null,
        }}
      />
    </Tabs>
  );
}
