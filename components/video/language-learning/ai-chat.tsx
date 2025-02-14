import { RefreshCw, Send } from 'lucide-react-native';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Message, useChatStore } from '~/lib/stores/chat-store';
import { supabase } from '~/lib/supabase';
import { SubtitleSegment } from '../video-player';

interface AIChatProps {
  language: string;
  subtitles: SubtitleSegment[];
  currentTime: number;
  videoTitle?: string;
  videoDescription?: string;
  videoId: string;
}

export function AIChat({
  language,
  subtitles,
  currentTime,
  videoTitle,
  videoDescription,
  videoId,
}: AIChatProps) {
  const { messages, addMessage, clearMessages } = useChatStore();
  const currentMessages = messages[videoId] || [];
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Get relevant subtitles for context (past few lines)
  const getRelevantSubtitles = () => {
    const contextWindow = 30; // 30 seconds of context
    return subtitles
      .filter(
        (sub) =>
          sub.start >= currentTime - contextWindow && sub.start <= currentTime
      )
      .map((sub) => {
        const current = sub.start <= currentTime && sub.end >= currentTime;
        const msg = `[${sub.start.toFixed(1)} - ${sub.end.toFixed(1)}] ${sub.text}`;
        return current ? '<current>' + msg + '</current>' : msg;
      })
      .join('\n');
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
    };

    addMessage(videoId, newMessage);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          language,
          messages: currentMessages.concat(newMessage),
          subtitleContext: getRelevantSubtitles(),
          videoTitle,
          videoDescription,
        },
      });

      if (error) throw error;

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
      };

      addMessage(videoId, aiResponse);
    } catch (error) {
      console.error('Error in AI chat:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
      };
      addMessage(videoId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'} flex flex-col`}
    >
      <View
        className={`flex-row justify-end border-b p-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <Pressable
          onPress={() => clearMessages(videoId)}
          className='flex-row items-center rounded-full bg-blue-500 px-3 py-1.5 active:opacity-80'
        >
          <RefreshCw size={16} color='white' className='mr-1' />
          <Text className='text-sm font-medium text-white'>New Chat</Text>
        </Pressable>
      </View>
      <GestureDetector gesture={Gesture.Native()}>
        <ScrollView
          className='h-0 px-4 py-2'
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={true}
          scrollEventThrottle={16}
          onScroll={(e) => {
            if (e.nativeEvent.contentOffset.y > 0) {
              e.stopPropagation();
            }
          }}
        >
          {currentMessages.map((message) => (
            <View
              key={message.id}
              className={`mb-4 ${message.isUser ? 'items-end' : 'items-start'}`}
            >
              <View
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.isUser
                    ? 'bg-blue-500'
                    : isDark
                      ? 'bg-gray-700'
                      : 'bg-gray-200'
                }`}
              >
                <Text
                  className={`${
                    message.isUser || isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </GestureDetector>
      <View
        className={`flex-row items-center border-t p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder='Ask about the video...'
          placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
          className={`mr-2 flex-1 rounded-full px-4 py-2 ${
            isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
          }`}
          onSubmitEditing={sendMessage}
        />
        <Pressable
          onPress={sendMessage}
          className='rounded-full bg-blue-500 p-2 active:opacity-80'
          disabled={isLoading}
        >
          <Send size={20} color='white' />
        </Pressable>
      </View>
    </View>
  );
}
