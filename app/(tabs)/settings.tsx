import { Stack, useRouter } from 'expo-router';
import {
  Bell,
  ChevronLeft,
  Globe,
  LogOut,
  Moon,
  Settings,
  Volume2,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Switch } from '~/components/ui/switch';
import { Text } from '~/components/ui/text';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { iconWithClassName } from '~/lib/icons/iconWithClassName';
import { useAuthStore } from '~/lib/stores/auth-store';
import { supabase } from '~/lib/supabase';
import { useColorScheme } from '~/lib/useColorScheme';

const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Italian', value: 'it' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Chinese', value: 'zh' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
] as const;

const PROFICIENCY_LEVELS = [
  { label: 'Beginner (A1)', value: 'a1' },
  { label: 'Elementary (A2)', value: 'a2' },
  { label: 'Intermediate (B1)', value: 'b1' },
  { label: 'Upper Intermediate (B2)', value: 'b2' },
  { label: 'Advanced (C1)', value: 'c1' },
  { label: 'Mastery (C2)', value: 'c2' },
] as const;

iconWithClassName(Globe);
iconWithClassName(Volume2);
iconWithClassName(Settings);
iconWithClassName(ChevronLeft);
iconWithClassName(Bell);
iconWithClassName(Moon);

export default function SettingsScreen() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const { isDarkColorScheme, setColorScheme } = useColorScheme();
  const [targetLanguage, setTargetLanguage] = useState<
    (typeof LANGUAGE_OPTIONS)[number] | undefined
  >();
  const [proficiencyLevel, setProficiencyLevel] = useState<
    (typeof PROFICIENCY_LEVELS)[number] | undefined
  >();
  const [autoPlay, setAutoPlay] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleColorScheme = () => {
    const newTheme = isDarkColorScheme ? 'light' : 'dark';
    setColorScheme(newTheme);
    setAndroidNavigationBar(newTheme);
  };

  const SettingItem = ({ icon: Icon, title, children }: any) => (
    <View className='flex-row items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800'>
      <View className='flex-row items-center gap-3'>
        <Icon size={20} className='text-gray-600 dark:text-gray-400' />
        <Text className='text-base text-gray-900 dark:text-gray-100'>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              className='ml-2 mr-2'
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ChevronLeft size={24} className='text-foreground' />
            </Pressable>
          ),
        }}
      />
      <ScrollView className='flex-1 bg-white dark:bg-gray-950'>
        <View className='px-4 py-6'>
          {/* Language Settings */}
          <View className='mb-6'>
            <Text className='mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
              Language Preferences
            </Text>
            <SettingItem icon={Globe} title='Target Language'>
              <View className='w-32'>
                <Select
                  value={targetLanguage}
                  onValueChange={setTargetLanguage as any}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select language' />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <SelectItem
                        key={lang.value}
                        label={lang.label}
                        value={lang.value}
                      >
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </View>
            </SettingItem>
            <SettingItem icon={Volume2} title='Proficiency Level'>
              <View className='w-32'>
                <Select
                  value={proficiencyLevel}
                  onValueChange={setProficiencyLevel as any}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select level' />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFICIENCY_LEVELS.map((level) => (
                      <SelectItem
                        key={level.value}
                        label={level.label}
                        value={level.value}
                      >
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </View>
            </SettingItem>
          </View>

          {/* App Settings */}
          <View className='mb-6'>
            <Text className='mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
              App Preferences
            </Text>
            <SettingItem icon={Settings} title='Auto-play Videos'>
              <Switch checked={autoPlay} onCheckedChange={setAutoPlay} />
            </SettingItem>
            <SettingItem icon={Bell} title='Notifications'>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </SettingItem>
            <SettingItem icon={Moon} title='Dark Mode'>
              <Switch
                checked={isDarkColorScheme}
                onCheckedChange={toggleColorScheme}
              />
            </SettingItem>
          </View>

          {/* Account Actions */}
          <View className='mt-6'>
            <Button
              variant='destructive'
              onPress={handleSignOut}
              className='w-full flex-row items-center justify-center gap-2 bg-red-600 dark:bg-red-700'
            >
              <LogOut size={20} />
              <Text className='font-semibold text-white'>Sign Out</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
