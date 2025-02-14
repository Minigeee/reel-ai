import { BottomSheetView } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Sheet } from '~/components/ui/sheet';
import { Text } from '~/components/ui/text';
import { useCreatorStore } from '~/lib/stores/creator-store';

interface SelectVideoSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

export function SelectVideoSheet({
  isVisible,
  onClose,
}: SelectVideoSheetProps) {
  const setVideoFile = useCreatorStore((state) => state.setVideoFile);

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setVideoFile({
        uri: asset.uri,
        duration: asset.duration || 0,
      });
      onClose();
    }
  };

  const recordVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setVideoFile({
        uri: asset.uri,
        duration: asset.duration || 0,
      });
      onClose();
    }
  };

  return (
    <Sheet isVisible={isVisible} onClose={onClose} snapPoints={['25%']}>
      <BottomSheetView style={styles.container}>
        <TouchableOpacity style={styles.option} onPress={pickVideo}>
          <Image size={32} />
          <Text>Choose from Library</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={recordVideo}>
          <Camera size={32} />
          <Text>Record Video</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
});
