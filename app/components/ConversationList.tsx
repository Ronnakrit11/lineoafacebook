"use client";

import React from 'react';
import { ConversationWithMessages } from '../types/chat';
import Image from 'next/image';

interface ConversationListProps {
  conversations: ConversationWithMessages[];
  onSelect: (conversation: ConversationWithMessages) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  onSelect 
}) => {
  const getDefaultAvatar = (platform: string) => {
    return platform === 'LINE' ? '/line-default-avatar.png' : '/facebook-default-avatar.png';
  };

  return (
    <div className="w-1/4 border-r overflow-y-auto">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          onClick={() => onSelect(conv)}
          className="p-4 hover:bg-gray-100 cursor-pointer flex items-center gap-3 border-b"
        >
          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            {conv.pictureUrl ? (
              <Image
                src={conv.pictureUrl}
                alt={conv.displayName || 'User avatar'}
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <Image
                src={getDefaultAvatar(conv.platform)}
                alt="Default avatar"
                width={48}
                height={48}
                className="object-cover"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">
              {conv.displayName || `${conv.platform} User`}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {conv.platform} - {conv.userId}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};