"use client";

import React, { useEffect } from 'react';
import { ConversationWithMessages } from '../types/chat';
import { ConversationList } from './ConversationList';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { pusherClient, PUSHER_EVENTS, PUSHER_CHANNELS } from '@/lib/pusher';
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
    updateConversation,
    addMessage,
  } = useConversationStore();

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations, setConversations]);

  useEffect(() => {
    const channel = pusherClient.subscribe(PUSHER_CHANNELS.CHAT);
    
    channel.bind(PUSHER_EVENTS.MESSAGE_RECEIVED, (message: any) => {
      console.log('Message received:', message);
      if (message.conversationId) {
        addMessage(message);
      }
    });

    channel.bind(PUSHER_EVENTS.CONVERSATION_UPDATED, (conversation: any) => {
      console.log('Conversation updated:', conversation);
      if (conversation.id) {
        updateConversation(conversation);
      }
    });

    // Fetch initial conversations
    fetch('/api/webhooks/conversations')
      .then(res => res.json())
      .then(data => setConversations(data))
      .catch(err => console.error('Error fetching conversations:', err));

    return () => {
      pusherClient.unsubscribe(PUSHER_CHANNELS.CHAT);
    };
  }, [updateConversation, setConversations, addMessage]);

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