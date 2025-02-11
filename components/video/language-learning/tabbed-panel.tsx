import { View, Text, Pressable } from 'react-native';
import { useState } from 'react';
import { ScrollingSubtitles } from './scrolling-subtitles';
import { AIChat } from './ai-chat';
import type { SubtitleSegment } from '../video-player';

interface TabbedPanelProps {
  subtitles: SubtitleSegment[];
  currentTime: number;
  videoId: string;
  onWordPress: (word: string) => void;
  language: string;
}

type Tab = 'subtitles' | 'chat';

export function TabbedPanel({ subtitles, currentTime, videoId, onWordPress, language }: TabbedPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('subtitles');

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-row border-b border-gray-200 dark:border-gray-700">
        <TabButton
          label="Subtitles"
          isActive={activeTab === 'subtitles'}
          onPress={() => setActiveTab('subtitles')}
        />
        <TabButton
          label="AI Tutor"
          isActive={activeTab === 'chat'}
          onPress={() => setActiveTab('chat')}
        />
      </View>

      <View className="flex-1">
        {activeTab === 'subtitles' ? (
          <ScrollingSubtitles
            language={language}
            subtitles={subtitles}
            currentTime={currentTime}
            onWordPress={onWordPress}
          />
        ) : (
          <AIChat videoId={videoId} />
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
      className={`flex-1 py-3 px-4 ${isActive ? 'border-b-2 border-blue-500' : ''}`}
    >
      <Text
        className={`text-center ${
          isActive ? 'text-blue-500 font-semibold' : 'text-gray-600 dark:text-gray-400'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
