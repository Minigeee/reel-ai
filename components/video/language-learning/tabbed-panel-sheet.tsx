import { BottomSheetView } from '@gorhom/bottom-sheet';
import { Sheet } from '~/components/ui/sheet';
import { TabbedPanel } from './tabbed-panel';
import type { SubtitleSegment } from '../video-player';

interface TabbedPanelSheetProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  subtitles: SubtitleSegment[];
  currentTime: number;
  videoId: string;
  videoTitle: string;
  videoDescription?: string;
  onWordPress: (word: string) => void;
}

export function TabbedPanelSheet({
  isOpen,
  onClose,
  language,
  subtitles,
  currentTime,
  videoId,
  videoTitle,
  videoDescription,
  onWordPress,
}: TabbedPanelSheetProps) {
  return (
    <Sheet isVisible={isOpen} onClose={onClose} snapPoints={['60%']}>
      <BottomSheetView className='flex-1'>
        <TabbedPanel
          language={language}
          subtitles={subtitles}
          currentTime={currentTime}
          videoId={videoId}
          videoTitle={videoTitle}
          videoDescription={videoDescription}
          onWordPress={onWordPress}
        />
      </BottomSheetView>
    </Sheet>
  );
}
