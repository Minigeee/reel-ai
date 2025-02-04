'use client';

import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/providers/auth-provider';
import { uploadVideo } from '@/lib/services/video-upload';
import { useState } from 'react';
import { VideoPlayer } from './video-player';
import { VideoSelector } from './video-selector';

export function VideoCreator() {
  const [selectedVideo, setSelectedVideo] = useState<{
    path: string;
    url: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const handleUpload = async () => {
    if (!selectedVideo || !user) return;

    setIsUploading(true);
    try {
      const uploadId = await uploadVideo(selectedVideo.path, user.id);
      toast({
        title: 'Video uploaded',
        description: 'Your video has been uploaded successfully',
      });
      // You might want to redirect to an edit page or dashboard here
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='mx-auto max-w-md space-y-6 p-4'>
      {!selectedVideo ? (
        <VideoSelector onSelect={setSelectedVideo} />
      ) : (
        <>
          <VideoPlayer url={selectedVideo.url} />

          <div className='space-y-4'>
            {/* Future edit controls will go here */}

            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className='w-full'
            >
              {isUploading ? 'Uploading...' : 'Upload Video'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
