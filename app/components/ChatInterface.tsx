"use client";

import React, { useEffect } from 'react';
import { ConversationWithMessages } from '../types/chat';
import { ConversationList } from './ConversationList';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { getSocket } from '@/lib/socket';
import { useConversationStore } from '../store/useConversationStore';

interface ChatInterfaceProps {
  initialConversations: ConversationWithMessages[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialConversations }) => {
  const {
    conversations,
    selectedConversation,
    setConversations,
    setSelectedConversation,
    updateConversation,
  } = useConversationStore();

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations, setConversations]);

  useEffect(() => {
    const socket = getSocket();

    socket.on('messageReceived', (updatedConversation: ConversationWithMessages) => {
      updateConversation(updatedConversation);
    });

    return () => {
      socket.off('messageReceived');
    };
  }, [updateConversation]);

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content,
          platform: selectedConversation.platform,
        }),
      });

      if (response.ok) {
        const updatedConversation = await response.json();
        updateConversation(updatedConversation);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-screen">
      <ConversationList 
        conversations={conversations} 
        onSelect={setSelectedConversation}
        selectedId={selectedConversation?.id} 
      />

      <div className="w-3/4 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 bg-gray-200 font-bold">
              {selectedConversation.platform} Chat
            </div>

            <MessageList messages={selectedConversation.messages} />
            <MessageInput onSend={handleSendMessage} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;