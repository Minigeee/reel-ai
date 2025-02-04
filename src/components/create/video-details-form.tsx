import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/providers/auth-provider';
import { uploadVideo } from '@/lib/services/video-upload';
import { useCreatorStore } from '@/lib/stores/creator-store';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

export function VideoDetailsForm() {
  const { videoFile, videoDetails, setVideoDetails, reset } = useCreatorStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !user) return;

    setIsPublishing(true);
    try {
      const uploadId = await uploadVideo(videoFile.path, user.id, videoDetails);

      toast({
        title: 'Video published!',
        description: 'Your video has been uploaded successfully',
      });
      
      reset();
      router.push(`/videos/${uploadId}`);
    } catch (error) {
      toast({
        title: 'Publishing failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Title
          </Label>
          <Input
            id="title"
            value={videoDetails.title}
            onChange={(e) => setVideoDetails({ title: e.target.value })}
            required
            maxLength={100}
            placeholder="Give your video a title"
            className="h-12" // Larger touch target
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            value={videoDetails.description}
            onChange={(e) => setVideoDetails({ description: e.target.value })}
            placeholder="What's your video about?"
            rows={4}
            className="resize-none" // Prevent resizing on mobile
          />
        </div>

        {/* TODO: Add tags and category inputs */}
      </Card>

      <Button 
        type="submit" 
        className="w-full h-12 text-base" // Larger button for mobile
        disabled={isPublishing || !videoDetails.title}
      >
        {isPublishing ? 'Publishing...' : 'Publish Video'}
      </Button>
    </form>
  );
} 