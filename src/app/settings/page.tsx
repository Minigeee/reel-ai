'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const themeOptions = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className='container max-w-md p-4 space-y-4'>
      <h1 className='text-2xl font-bold'>Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how Reel AI looks on your device
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='theme'>Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue placeholder='Select theme' />
              </SelectTrigger>
              <SelectContent>
                {themeOptions.map(({ value, label, icon: Icon }) => (
                  <SelectItem key={value} value={value}>
                    <div className='flex items-center gap-2'>
                      <Icon className='h-4 w-4' />
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add account settings here */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>
            Control your privacy settings and data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add privacy settings here */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>
            Information about Reel AI
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div>
            <Label>Version</Label>
            <p className='text-sm text-muted-foreground'>1.0.0</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 