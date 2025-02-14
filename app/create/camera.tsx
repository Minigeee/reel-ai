import {
  CameraType,
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from 'expo-camera';
import { useRouter } from 'expo-router';
import { Camera as CameraIcon, RotateCw } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '~/components/ui/button';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [type, setType] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  if (!permission || !micPermission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted || !micPermission.granted) {
    // Camera or microphone permissions are not granted yet
    return (
      <View className='flex-1 items-center justify-center p-4'>
        <Text className='mb-4 text-center text-lg'>
          We need your permission to use the camera and microphone
        </Text>
        <Button
          onPress={async () => {
            await requestPermission();
            await requestMicPermission();
          }}
        >
          Grant Permission
        </Button>
      </View>
    );
  }

  const toggleCameraType = () => {
    setType((current) => (current === 'back' ? 'front' : 'back'));
  };

  const startRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          maxDuration: 300, // 5 minutes
        });
        router.push({
          pathname: '/create/edit',
          params: { videoUri: video?.uri },
        });
      } catch (error) {
        console.error('Error recording:', error);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  return (
    <View className='flex-1'>
      <CameraView ref={cameraRef} facing={type} className='flex-1'>
        <View className='flex-1 justify-end gap-4 p-4'>
          <Button
            variant='ghost'
            size='icon'
            onPress={toggleCameraType}
            className='mb-4 self-center'
          >
            <RotateCw className='h-6 w-6' />
          </Button>

          <Button
            onPress={isRecording ? stopRecording : startRecording}
            className='h-16 w-16 self-center rounded-full bg-red-500'
          >
            <CameraIcon className='h-8 w-8' />
          </Button>
        </View>
      </CameraView>
    </View>
  );
}
