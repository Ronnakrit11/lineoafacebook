"use client";

import React from 'react';
import { ConversationWithMessages } from '../types/chat';

interface ConversationListProps {
  conversations: ConversationWithMessages[];
  onSelect: (conversation: ConversationWithMessages) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  onSelect 
}) => {
  return (
    <div className="w-1/4 border-r overflow-y-auto">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          onClick={() => onSelect(conv)}
          className="p-2 hover:bg-gray-100 cursor-pointer"
        >
          {conv.platform} - {conv.userId}
        </div>
      ))}
    </div>
  );
};