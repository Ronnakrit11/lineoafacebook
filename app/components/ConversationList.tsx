"use client";

import React from 'react';
import { ConversationWithMessages } from '../types/chat';

interface ConversationListProps {
  conversations: ConversationWithMessages[];
  onSelect: (conversation: ConversationWithMessages) => void;
  selectedId?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  onSelect,
  selectedId 
}) => {
  return (
    <div className="w-1/4 border-r overflow-y-auto">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          onClick={() => onSelect(conv)}
          className={`p-4 hover:bg-gray-100 cursor-pointer ${
            selectedId === conv.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className="font-medium">{conv.platform}</div>
          <div className="text-sm text-gray-600">User: {conv.userId}</div>
          <div className="text-xs text-gray-400 mt-1">
            {conv.messages[conv.messages.length - 1]?.content.substring(0, 30)}...
          </div>
        </div>
      ))}
    </div>
  );
};