"use client";

import React from 'react';
import { Message } from '@prisma/client';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm ${
            msg.sender === 'USER'
              ? 'ml-auto bg-primary text-primary-foreground'
              : 'mr-auto bg-secondary text-secondary-foreground'
          }`}
        >
          {msg.content}
        </div>
      ))}
    </div>
  );
};