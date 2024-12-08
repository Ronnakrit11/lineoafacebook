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
    <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.sender === 'USER' ? 'justify-start' : 'justify-end'}`}
        >
          <div
            className={`max-w-[70%] rounded-lg p-3 ${
              msg.sender === 'USER'
                ? 'bg-white text-gray-800 border border-gray-200'
                : 'bg-blue-500 text-white'
            }`}
          >
            <div className="text-sm mb-1">
              {msg.sender}
            </div>
            <div className="break-words">{msg.content}</div>
            <div className="text-xs opacity-75 mt-1">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};