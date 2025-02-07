import { View, StyleSheet } from 'react-native';
import { Sheet } from '~/components/ui/sheet';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { useCreatorStore } from '~/lib/stores/creator-store';
import { supabase } from '~/lib/supabase';
import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { BottomSheetView } from '@gorhom/bottom-sheet';

interface UploadSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

export function UploadSheet({ isVisible, onClose }: UploadSheetProps) {
  const { videoFile, videoDetails, setVideoDetails, reset } = useCreatorStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async () => {
    if (!videoFile || !videoDetails.title) return;

    setIsUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      if (!session || !user) return;

      // Generate thumbnail
      const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(videoFile.uri, {
        time: 0,
        quality: 0.7,
      });

      const fileExt = videoFile.uri.split('.').pop();
      const fileId = Math.random();
      const filePath = `${user.id}/${fileId}.${fileExt}`;
      const thumbnailPath = `${user.id}/${fileId}.jpg`;

      // Get pre-signed URLs for direct upload
      const [videoSignedResult, thumbnailSignedResult] = await Promise.all([
        supabase.storage.from('videos').createSignedUploadUrl(filePath),
        supabase.storage.from('thumbnails').createSignedUploadUrl(thumbnailPath)
      ]);

      const videoSignedUrl = videoSignedResult.data?.signedUrl;
      const videoToken = videoSignedResult.data?.token;
      const thumbnailSignedUrl = thumbnailSignedResult.data?.signedUrl;
      const thumbnailToken = thumbnailSignedResult.data?.token;

      if (!videoSignedUrl || !videoToken || !thumbnailSignedUrl || !thumbnailToken) {
        throw new Error('Failed to get upload URLs');
      }

      // Map ext to Content-Type
      const mimeTypes: Record<string, string> = {
        'mp4': 'video/mp4',
        'mov': 'video/quicktime',
        'm4v': 'video/x-m4v',
        'webm': 'video/webm',
        'ogv': 'video/ogg',
        'mkv': 'video/x-matroska',
        'avi': 'video/avi',
        'mpg': 'video/mpeg',
        'mpeg': 'video/mpeg',
        '3gp': 'video/3gpp'
      };
      const contentType = mimeTypes[fileExt?.toLowerCase() ?? ''] || `video/${fileExt}`;

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
        })
      ]);

      if (videoUploadResult.status !== 200 || thumbnailUploadResult.status !== 200) {
        throw new Error('Upload failed');
      }

      const { data: { publicUrl: videoPublicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      const { data: { publicUrl: thumbnailPublicUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(thumbnailPath);

      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: videoDetails.title,
          description: videoDetails.description,
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
      <BottomSheetView style={styles.container}>
        <Input
          placeholder="Title"
          value={videoDetails.title}
          onChangeText={(text) => setVideoDetails({ title: text })}
        />
        <Input
          placeholder="Description"
          value={videoDetails.description}
          onChangeText={(text) => setVideoDetails({ description: text })}
          multiline
          numberOfLines={3}
        />
        {isUploading && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${uploadProgress * 100}%` }]} />
            <Text>{Math.round(uploadProgress * 100)}%</Text>
          </View>
        )}
        <Button 
          onPress={handleUpload}
          disabled={isUploading || !videoDetails.title}
        >
          <Text>{isUploading ? 'Uploading...' : 'Upload Video'}</Text>
        </Button>
      </BottomSheetView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  progressContainer: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
}); 