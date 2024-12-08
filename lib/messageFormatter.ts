import { Message, Conversation } from '@prisma/client';
import type { ConversationWithMessages } from '@/app/types/chat';

interface PusherMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
}

interface PusherConversation {
  id: string;
  platform: string;
  userId: string;
  lastMessage?: PusherMessage;  // Make lastMessage optional
}

export function formatMessageForPusher(message: Message): PusherMessage {
  return {
    id: message.id,
    content: message.content,
    sender: message.sender,
    timestamp: message.timestamp,
  };
}

export function formatConversationForPusher(
  conversation: ConversationWithMessages
): PusherConversation {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  
  const baseConversation: PusherConversation = {
    id: conversation.id,
    platform: conversation.platform,
    userId: conversation.userId,
  };

  if (lastMessage) {
    return {
      ...baseConversation,
      lastMessage: formatMessageForPusher(lastMessage),
    };
  }

  return baseConversation;
}