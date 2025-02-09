import { BottomSheetView } from '@gorhom/bottom-sheet';
import * as FileSystem from 'expo-file-system';
import * as VideoThumbnails from 'expo-video-thumbnails';
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!session || !user) return;

      // Generate thumbnail
      const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(
        videoFile.uri,
        {
          time: 0,
          quality: 0.7,
        }
      );

      const fileExt = videoFile.uri.split('.').pop();
      const fileId = Math.random();
      const filePath = `${user.id}/${fileId}.${fileExt}`;
      const thumbnailPath = `${user.id}/${fileId}.jpg`;

      // Get pre-signed URLs for direct upload
      const [videoSignedResult, thumbnailSignedResult] = await Promise.all([
        supabase.storage.from('videos').createSignedUploadUrl(filePath),
        supabase.storage
          .from('thumbnails')
          .createSignedUploadUrl(thumbnailPath),
      ]);

      const videoSignedUrl = videoSignedResult.data?.signedUrl;
      const videoToken = videoSignedResult.data?.token;
      const thumbnailSignedUrl = thumbnailSignedResult.data?.signedUrl;
      const thumbnailToken = thumbnailSignedResult.data?.token;

      if (
        !videoSignedUrl ||
        !videoToken ||
        !thumbnailSignedUrl ||
        !thumbnailToken
      ) {
        throw new Error('Failed to get upload URLs');
      }

      // Map ext to Content-Type
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
      const contentType =
        mimeTypes[fileExt?.toLowerCase() ?? ''] || `video/${fileExt}`;

      // Upload video and thumbnail in parallel
      const [videoUploadResult, thumbnailUploadResult] = await Promise.all([
        FileSystem.uploadAsync(videoSignedUrl, videoFile.uri, {
          httpMethod: 'PUT',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          headers: {
            'Content-Type': contentType,
          },
          sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
        }),
        FileSystem.uploadAsync(thumbnailSignedUrl, thumbnailUri, {
          httpMethod: 'PUT',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          headers: {
            'Content-Type': 'image/jpeg',
          },
          sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
        }),
      ]);

      if (
        videoUploadResult.status !== 200 ||
        thumbnailUploadResult.status !== 200
      ) {
        throw new Error('Upload failed');
      }

      const {
        data: { publicUrl: videoPublicUrl },
      } = supabase.storage.from('videos').getPublicUrl(filePath);

      const {
        data: { publicUrl: thumbnailPublicUrl },
      } = supabase.storage.from('thumbnails').getPublicUrl(thumbnailPath);

      const { error: dbError } = await supabase.from('videos').insert({
        user_id: user.id,
        title: videoDetails.title,
        description: videoDetails.description,
        language: videoDetails.language.value,
        difficulty: videoDetails.difficulty?.value as any,
        video_url: videoPublicUrl,
        thumbnail_url: thumbnailPublicUrl,
        duration: videoFile.duration,
        status: 'published',
      });

      if (dbError) throw dbError;

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
      <BottomSheetView className="p-4 gap-4">
        <Text className="text-lg font-medium">Upload Video</Text>
        
        <View className="gap-2">
          <Text className="text-sm font-medium">Title *</Text>
          <Input
            placeholder="Enter video title"
            value={videoDetails.title}
            onChangeText={(text) =>
              setVideoDetails({ ...videoDetails, title: text })
            }
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium">Language *</Text>
          <Select
            value={videoDetails.language}
            onValueChange={(value) =>
              setVideoDetails({ ...videoDetails, language: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
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

        <View className="gap-2">
          <Text className="text-sm font-medium">Difficulty Level</Text>
          <Select
            value={videoDetails.difficulty}
            onValueChange={(value) =>
              setVideoDetails({ ...videoDetails, difficulty: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose difficulty (optional)" />
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

        <View className="gap-2">
          <Text className="text-sm font-medium">Description</Text>
          <Input
            placeholder="Add a description (optional)"
            value={videoDetails.description}
            onChangeText={(text) =>
              setVideoDetails({ ...videoDetails, description: text })
            }
            multiline
            numberOfLines={3}
            className="pt-2 align-text-top"
          />
        </View>

        {isUploading && (
          <View className="gap-2">
            <View className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${uploadProgress * 100}%` }}
              />
            </View>
            <Text className="text-xs text-green-500 text-center">
              {Math.round(uploadProgress * 100)}%
            </Text>
          </View>
        )}

        <View className="mt-4">
          <Button
            onPress={handleUpload}
            disabled={isUploading || !videoDetails.title || !videoDetails.language}
            variant={isUploading ? "secondary" : "default"}
            className="w-full"
          >
            <Text>{isUploading ? 'Uploading...' : 'Upload Video'}</Text>
          </Button>
        </View>
      </BottomSheetView>
    </Sheet>
  );
}
