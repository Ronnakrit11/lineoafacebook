"use client";

import React, { useEffect, useState } from 'react';
import { ConversationWithMessages } from '../types/chat';
import { ConversationList } from './ConversationList';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { getSocket } from '@/lib/socket';
import { useConversationStore } from '../store/useConversationStore';

interface ChatInterfaceProps {
  initialConversations: ConversationWithMessages[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialConversations }) => {
  const {
    conversations,
    selectedConversation,
    setConversations,
    setSelectedConversation,
    updateConversation
  } = useConversationStore();

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations, setConversations]);

  useEffect(() => {
    const socket = getSocket();
    
    if (socket) {
      const handleMessageReceived = (updatedConversation: ConversationWithMessages) => {
        console.log('Message received:', updatedConversation);
        updateConversation(updatedConversation);
      };

      socket.on('messageReceived', handleMessageReceived);

      // Fetch initial conversations
      fetch('/api/webhooks/conversations')
        .then(res => res.json())
        .then(data => setConversations(data))
        .catch(err => console.error('Error fetching conversations:', err));

      return () => {
        socket.off('messageReceived', handleMessageReceived);
      };
    }
  }, [updateConversation, setConversations]);

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

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const updatedConversation = await response.json();
      updateConversation(updatedConversation);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <ConversationList 
        conversations={conversations} 
        onSelect={setSelectedConversation}
        selectedId={selectedConversation?.id}
      />

      <div className="w-3/4 flex flex-col bg-white shadow-lg">
        {selectedConversation ? (
          <>
            <div className="p-4 bg-blue-500 text-white font-bold">
              {selectedConversation.platform} Chat - {selectedConversation.userId}
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