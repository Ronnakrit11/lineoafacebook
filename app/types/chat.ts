import { Conversation as PrismaConversation, Message as PrismaMessage } from '@prisma/client';

export type ConversationWithMessages = PrismaConversation & {
  messages: PrismaMessage[];
};

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  platform: 'LINE' | 'FACEBOOK';
}