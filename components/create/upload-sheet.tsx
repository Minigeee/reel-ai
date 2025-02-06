import { View, StyleSheet } from 'react-native';
import { Sheet } from '~/components/ui/sheet';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { useCreatorStore } from '~/lib/stores/creator-store';
import { supabase } from '~/lib/supabase';
import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
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

      const fileExt = videoFile.uri.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      // Get pre-signed URL for direct upload
      const { data: signedUploadResult } = await supabase.storage
        .from('videos')
        .createSignedUploadUrl(filePath);
      const signedUrl = signedUploadResult?.signedUrl;
      const token = signedUploadResult?.token;

      if (!signedUrl || !token) throw new Error('Failed to get upload URL');

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

      // Upload using FileSystem with progress tracking
      const uploadResult = await FileSystem.uploadAsync(signedUrl, videoFile.uri, {
        httpMethod: 'PUT',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          'Content-Type': contentType,
        },
        sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
      });

      if (uploadResult.status !== 200) {
        throw new Error('Upload failed');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: videoDetails.title,
          description: videoDetails.description,
          video_url: publicUrl,
          duration: videoFile.duration,
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