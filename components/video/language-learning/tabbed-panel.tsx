import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { SubtitleSegment } from '../video-player';
import { AIChat } from './ai-chat';
import { ScrollingSubtitles } from './scrolling-subtitles';

interface TabbedPanelProps {
  subtitles: SubtitleSegment[];
  currentTime: number;
  videoTitle: string;
  videoDescription?: string;
  onWordPress: (word: string) => void;
  language: string;
  videoId: string;
}

type Tab = 'subtitles' | 'chat';

export function TabbedPanel({
  subtitles,
  currentTime,
  videoTitle,
  videoDescription,
  onWordPress,
  language,
  videoId,
}: TabbedPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('subtitles');

  return (
    <View className='flex-1 bg-white dark:bg-gray-900'>
      <View className='flex-row border-b border-gray-200 dark:border-gray-700'>
        <TabButton
          label='Subtitles'
          isActive={activeTab === 'subtitles'}
          onPress={() => setActiveTab('subtitles')}
        />
        <TabButton
          label='AI Tutor'
          isActive={activeTab === 'chat'}
          onPress={() => setActiveTab('chat')}
        />
      </View>

      <View className='flex-1'>
        {activeTab === 'subtitles' ? (
          <ScrollingSubtitles
            language={language}
            subtitles={subtitles}
            currentTime={currentTime}
            onWordPress={onWordPress}
          />
        ) : (
          <AIChat
            language={language}
            subtitles={subtitles}
            currentTime={currentTime}
            videoTitle={videoTitle}
            videoDescription={videoDescription}
            videoId={videoId}
          />
        )}
      </View>
    </View>
  );
}

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

function TabButton({ label, isActive, onPress }: TabButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 px-4 py-3 ${isActive ? 'border-b-2 border-blue-500' : ''}`}
    >
      <Text
        className={`text-center ${
          isActive
            ? 'font-semibold text-blue-500'
            : 'text-gray-600 dark:text-gray-400'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
