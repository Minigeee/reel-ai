import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { Send } from 'lucide-react-native';
import { useState } from 'react';

interface AIChatProps {
  videoId: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export function AIChat({ videoId }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    // Mock AI response - in real app, this would call an AI API
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'This is a mock AI response. In the real app, this would be powered by an AI language model.',
        isUser: false,
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-4 py-2">
        {messages.map(message => (
          <View
            key={message.id}
            className={`mb-4 ${message.isUser ? 'items-end' : 'items-start'}`}
          >
            <View
              className={`rounded-lg px-4 py-2 max-w-[80%] ${
                message.isUser ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            >
              <Text className="text-white">{message.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View className="flex-row items-center p-4 border-t border-gray-700">
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about the video..."
          placeholderTextColor="#9ca3af"
          className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 mr-2"
          onSubmitEditing={sendMessage}
        />
        <Pressable
          onPress={sendMessage}
          className="bg-blue-500 rounded-full p-2 active:opacity-80"
        >
          <Send size={20} color="white" />
        </Pressable>
      </View>
    </View>
  );
}
