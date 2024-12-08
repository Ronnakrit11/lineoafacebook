"use client";

import React from 'react';
import { Message } from '@prisma/client';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="flex-grow overflow-y-auto p-4">
      {messages.map((msg) => (
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
  );
};