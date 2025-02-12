import { BottomSheetView } from '@gorhom/bottom-sheet';
import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Sheet } from '~/components/ui/sheet';
import { Text } from '~/components/ui/text';
import { useCreatorStore } from '~/lib/stores/creator-store';
import { supabase } from '~/lib/supabase';

interface UploadSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Italian', value: 'it' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Chinese', value: 'zh' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
];

const DIFFICULTY_LEVELS = [
  { label: 'Beginner (A1)', value: 'a1' },
  { label: 'Elementary (A2)', value: 'a2' },
  { label: 'Intermediate (B1)', value: 'b1' },
  { label: 'Upper Intermediate (B2)', value: 'b2' },
  { label: 'Advanced (C1)', value: 'c1' },
  { label: 'Mastery (C2)', value: 'c2' },
];

export function UploadSheet({ isVisible, onClose }: UploadSheetProps) {
  const { videoFile, videoDetails, setVideoDetails, reset } = useCreatorStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async () => {
    if (!videoFile || !videoDetails.title) return;

    setIsUploading(true);
    try {
      console.log(process.env.EXPO_PUBLIC_VIDEO_SERVER_URL);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const fname = videoFile.uri.split('/').pop() ?? 'video.mp4';
      const ext = fname.split('.').pop() ?? 'mp4'; // Map ext to Content-Type
      const mimeTypes: Record<string, string> = {
        mp4: 'video/mp4',
        mov: 'video/quicktime',
        m4v: 'video/x-m4v',
        webm: 'video/webm',
        ogv: 'video/ogg',
        mkv: 'video/x-matroska',
        avi: 'video/avi',
        mpg: 'video/mpeg',
        mpeg: 'video/mpeg',
        '3gp': 'video/3gpp',
      };
      const contentType = mimeTypes[ext?.toLowerCase() ?? ''] || `video/${ext}`;

      // Create form data for the upload
      const formData = new FormData();
      formData.append('video', {
        uri: videoFile.uri,
        type: contentType,
        name: fname,
      } as any);

      // Add metadata
      formData.append('language', videoDetails.language.value);
      formData.append('description', videoDetails.description || '');
      formData.append('title', videoDetails.title);
      if (videoDetails.difficulty?.value) {
        formData.append('difficulty', videoDetails.difficulty.value);
      }

      // Upload to server
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_VIDEO_SERVER_URL}/api/videos/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${session?.access_token}`,
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      reset();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Sheet isVisible={isVisible} onClose={onClose} snapPoints={['75%']}>
      <BottomSheetView className='gap-4 p-4'>
        <Text className='text-lg font-medium'>Upload Video</Text>

        <View className='gap-2'>
          <Text className='text-sm font-medium'>Title *</Text>
          <Input
            placeholder='Enter video title'
            value={videoDetails.title}
            onChangeText={(text) =>
              setVideoDetails({ ...videoDetails, title: text })
            }
          />
        </View>

        <View className='gap-2'>
          <Text className='text-sm font-medium'>Language *</Text>
          <Select
            value={videoDetails.language}
            onValueChange={(value) =>
              setVideoDetails({ ...videoDetails, language: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Select language' />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
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

        <View className='gap-2'>
          <Text className='text-sm font-medium'>Difficulty Level</Text>
          <Select
            value={videoDetails.difficulty}
            onValueChange={(value) =>
              setVideoDetails({ ...videoDetails, difficulty: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Choose difficulty (optional)' />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_LEVELS.map((level) => (
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

        <View className='gap-2'>
          <Text className='text-sm font-medium'>Description</Text>
          <Input
            placeholder='Add a description (optional)'
            value={videoDetails.description}
            onChangeText={(text) =>
              setVideoDetails({ ...videoDetails, description: text })
            }
            multiline
            numberOfLines={3}
            className='pt-2 align-text-top'
          />
        </View>

        {isUploading && (
          <View className='gap-2'>
            <View className='h-1 overflow-hidden rounded-full bg-gray-200'>
              <View
                className='h-full rounded-full bg-green-500'
                style={{ width: `${uploadProgress * 100}%` }}
              />
            </View>
            <Text className='text-center text-xs text-green-500'>
              {Math.round(uploadProgress * 100)}%
            </Text>
          </View>
        )}

        <View className='mt-4'>
          <Button
            onPress={handleUpload}
            disabled={
              isUploading || !videoDetails.title || !videoDetails.language
            }
            variant={isUploading ? 'secondary' : 'default'}
            className='w-full'
          >
            <Text>{isUploading ? 'Uploading...' : 'Upload Video'}</Text>
          </Button>
        </View>
      </BottomSheetView>
    </Sheet>
  );
}
