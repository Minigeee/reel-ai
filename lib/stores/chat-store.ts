import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface ChatState {
  messages: Record<string, Message[]>;
  addMessage: (videoId: string, message: Message) => void;
  clearMessages: (videoId: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: {},
      addMessage: (videoId, message) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [videoId]: [...(state.messages[videoId] || []), message],
          },
        })),
      clearMessages: (videoId) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [videoId]: [],
          },
        })),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
