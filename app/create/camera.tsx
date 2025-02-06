import React, { useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Button } from '~/components/ui/button';
import { useRouter } from 'expo-router';
import { Camera as CameraIcon, RotateCw } from 'lucide-react-native';

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
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-center mb-4">
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
    setType(current => (current === 'back' ? 'front' : 'back'));
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
          params: { videoUri: video?.uri }
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
    <View className="flex-1">
      <CameraView 
        ref={cameraRef}
        facing={type}
        className="flex-1"
      >
        <View className="flex-1 justify-end p-4 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onPress={toggleCameraType}
            className="self-center mb-4"
          >
            <RotateCw className="w-6 h-6" />
          </Button>

          <Button
            onPress={isRecording ? stopRecording : startRecording}
            className="w-16 h-16 rounded-full self-center bg-red-500"
          >
            <CameraIcon className="w-8 h-8" />
          </Button>
        </View>
      </CameraView>
    </View>
  );
} 