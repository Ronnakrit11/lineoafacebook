import React, { useState } from 'react';
import { Conversation, Message } from '@prisma/client';

interface ChatInterfaceProps {
  conversations: (Conversation & { messages: Message[] })[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversations }) => {
  const [selectedConversation, setSelectedConversation] = useState<(Conversation & { messages: Message[] }) | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await fetch(`/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage,
          platform: selectedConversation.platform,
        }),
      });

      if (response.ok) {
        const updatedConversation = await response.json();
        setSelectedConversation(updatedConversation);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Conversation List */}
      <div className="w-1/4 border-r overflow-y-auto">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => setSelectedConversation(conv)}
            className="p-2 hover:bg-gray-100 cursor-pointer"
          >
            {conv.platform} - {conv.userId}
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="w-3/4 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 bg-gray-200 font-bold">
              {selectedConversation.platform} Chat
            </div>

            {/* Message List */}
            <div className="flex-grow overflow-y-auto p-4">
              {selectedConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-2 p-2 rounded ${
                    msg.sender === 'USER'
                      ? 'bg-blue-100 text-right self-end'
                      : 'bg-gray-100 text-left self-start'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Send a message..."
                className="flex-grow p-2 border rounded-l"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white p-2 rounded-r"
              >
                Send
              </button>
            </div>
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