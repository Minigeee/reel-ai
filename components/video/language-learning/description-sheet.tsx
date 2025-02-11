import { BottomSheetView } from '@gorhom/bottom-sheet';
import { Text, View } from 'react-native';
import { Sheet } from '~/components/ui/sheet';

interface DescriptionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  username: string;
}

export function DescriptionSheet({
  isOpen,
  onClose,
  title,
  description,
  username,
}: DescriptionSheetProps) {
  return (
    <Sheet isVisible={isOpen} onClose={onClose} snapPoints={['60%']}>
      <BottomSheetView className='px-4 pb-8 pt-2'>
        <View className='mb-2'>
          <Text className='text-xl font-bold'>{title}</Text>
          <Text className='mb-4 text-sm'>@{username}</Text>
        </View>

        <Text className='text-base'>{description}</Text>
      </BottomSheetView>
    </Sheet>
  );
}
