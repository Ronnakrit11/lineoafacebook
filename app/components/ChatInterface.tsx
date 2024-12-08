"use client";

import React, { useState } from 'react';
import { ConversationWithMessages } from '../types/chat';
import { ConversationList } from './ConversationList';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatInterfaceProps {
  conversations: ConversationWithMessages[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversations }) => {
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithMessages | null>(null);

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
        setSelectedConversation(updatedConversation);
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