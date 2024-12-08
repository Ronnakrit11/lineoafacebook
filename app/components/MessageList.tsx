"use client";

import React, { useEffect, useRef } from 'react';
import { Message } from '@prisma/client';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`max-w-[70%] ${
            msg.sender === 'USER'
              ? 'ml-auto bg-blue-500 text-white rounded-l-lg rounded-tr-lg'
              : 'mr-auto bg-gray-200 text-gray-800 rounded-r-lg rounded-tl-lg'
          } p-3 break-words`}
        >
          <div className="text-sm mb-1">
            {msg.sender === 'USER' ? 'User' : 'Bot'}
          </div>
          {msg.content}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};