import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { convertFileSrc } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { Card } from '@/components/ui/card';
import { Upload, Camera } from 'lucide-react';

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

      const filePath = selected as string;
      const fileUrl = convertFileSrc(filePath);
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
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-center">
        Create New Video
      </h1>
      
      <div className="grid grid-cols-1 gap-4">
        <Card 
          className="p-6 flex flex-col items-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={handleSelectVideo}
        >
          <Upload className="h-8 w-8 text-primary" />
          <div className="text-center">
            <h3 className="font-medium">Choose from Gallery</h3>
            <p className="text-sm text-muted-foreground">
              Upload a video from your device
            </p>
          </div>
        </Card>

        <Card 
          className="p-6 flex flex-col items-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => {
            // TODO: Implement camera recording
            toast({
              title: 'Coming soon',
              description: 'Camera recording will be available soon',
            });
          }}
        >
          <Camera className="h-8 w-8 text-primary" />
          <div className="text-center">
            <h3 className="font-medium">Record Video</h3>
            <p className="text-sm text-muted-foreground">
              Create a new video using your camera
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
