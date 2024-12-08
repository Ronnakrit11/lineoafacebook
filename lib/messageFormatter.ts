import { Message } from '@prisma/client';
import type { ConversationWithMessages } from '@/app/types/chat';

export interface PusherMessage {
  id: string;
  conversationId: string;
  content: string;
  sender: string;
  timestamp: Date;
  platform: string;
}

export interface PusherConversation {
  id: string;
  platform: string;
  userId: string;
  messages: PusherMessage[];
}

export function formatMessageForPusher(message: Message): PusherMessage {
  return {
    id: message.id,
    conversationId: message.conversationId,
    content: message.content,
    sender: message.sender,
    timestamp: message.timestamp,
    platform: message.platform,
  };
}

export function formatConversationForPusher(
  conversation: ConversationWithMessages
): PusherConversation {
  return {
    id: conversation.id,
    platform: conversation.platform,
    userId: conversation.userId,
    messages: conversation.messages.map(formatMessageForPusher),
  };
}