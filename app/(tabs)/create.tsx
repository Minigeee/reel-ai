import { Stack } from 'expo-router';
import React from 'react';
import { SelectVideoSheet } from '~/components/create/select-video-sheet';
import { VideoCreator } from '~/components/create/video-creator';
import { useCreatorStore } from '~/lib/stores/creator-store';

export default function CreateScreen() {
  const videoFile = useCreatorStore((state) => state.videoFile);
  const reset = useCreatorStore((state) => state.reset);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {videoFile ? (
        <VideoCreator onClose={reset} />
      ) : (
        <SelectVideoSheet isVisible={true} onClose={() => {}} />
      )}
    </>
  );
}
