import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { convertFileSrc } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

interface VideoSelectorProps {
  onSelect: (fileInfo: { path: string; url: string }) => void;
  isLoading?: boolean;
}

export function VideoSelector({ onSelect, isLoading }: VideoSelectorProps) {
  const handleSelectVideo = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Video',
            extensions: ['mp4', 'mov', 'mkv', 'avi', 'webm'],
          },
        ],
      });

      if (!selected) return;

      // Convert the file path to a URL that can be used by react-player
      const filePath = selected as string;
      const fileUrl = convertFileSrc(filePath);
      console.log('fileUrl', fileUrl);

      onSelect({ path: filePath, url: fileUrl });
    } catch (error) {
      toast({
        title: 'Error selecting video',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      onClick={handleSelectVideo}
      className='w-full'
      size='lg'
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : 'Select Video'}
    </Button>
  );
}
