'use client';

import { useCreatorStore } from '@/lib/stores/creator-store';
import { VideoSelector } from './video-selector';
import { VideoDetailsForm } from './video-details-form';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from './video-player';
import { ArrowLeft } from 'lucide-react';

export function VideoCreator() {
  const { step, setStep, videoFile, setVideoFile } = useCreatorStore();

  const handleBack = () => {
    setStep(step - 1);
  };

  return (
    <div className="mx-auto max-w-md space-y-6 p-5">
      {step === 0 ? (
        <div className="space-y-6">
          {!videoFile ? (
            <VideoSelector
              onSelect={(file) => {
                setVideoFile(file);
                setStep(1);
              }}
            />
          ) : (
            <div className="space-y-4">
              <VideoPlayer url={videoFile.url} />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setVideoFile(null)}
                >
                  Choose Another
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Upload Details</h1>
          </div>
          
          {videoFile && <VideoPlayer url={videoFile.url} />}
          <VideoDetailsForm />
        </div>
      )}
    </div>
  );
}
