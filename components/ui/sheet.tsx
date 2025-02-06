import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

interface SheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: string[];
}

export function Sheet({
  isVisible,
  onClose,
  children,
  snapPoints: customSnapPoints,
}: SheetProps) {
  // Variables
  const snapPoints = useMemo(
    () => customSnapPoints ?? ['50%'],
    [customSnapPoints]
  );

  // Callbacks
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior='close'
      />
    ),
    []
  );

  // If not visible, return null to unmount the sheet
  if (!isVisible) return null;

  return (
    <BottomSheet
      snapPoints={snapPoints}
      index={0}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      style={styles.sheet}
    >
      <View style={styles.contentContainer}>{children}</View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  sheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
