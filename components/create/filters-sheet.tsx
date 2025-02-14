import { BottomSheetView } from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native';
import { Sheet } from '~/components/ui/sheet';
import { Text } from '~/components/ui/text';

interface FiltersSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

export function FiltersSheet({ isVisible, onClose }: FiltersSheetProps) {
  return (
    <Sheet isVisible={isVisible} onClose={onClose} snapPoints={['50%']}>
      <BottomSheetView style={styles.container}>
        <Text>Filters and effects coming soon!</Text>
      </BottomSheetView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
});
