import { Client } from '@line/bot-sdk';
import type { TextMessage } from '@line/bot-sdk';
import { PrismaClient } from '@prisma/client';
import { lineConfig } from '../config/lineConfig';
import { pusherServer } from '../pusher';
import { createMessage } from './messageService';
import { sendPusherEvents } from './pusherService';

const prisma = new PrismaClient();

export class LineMessageService {
  private client: Client;

  constructor() {
    this.client = new Client(lineConfig);
  }

  async sendMessage(userId: string, text: string): Promise<boolean> {
    try {
      const message: TextMessage = {
        type: 'text',
        text: text
      };

      // Send message to LINE first
      await this.client.pushMessage(userId, message);

      // Find the conversation for this user
      const conversation = await prisma.conversation.findFirst({
        where: {
          userId: userId,
          platform: 'LINE'
        },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      if (!conversation) {
        console.error('Conversation not found for user:', userId);
        return false;
      }

      // Create bot message in database
      const botMessage = await createMessage(prisma, {
        conversationId: conversation.id,
        content: text,
        sender: 'BOT',
        platform: 'LINE',
        timestamp: new Date(),
        externalId: `bot_${Date.now()}`
      });

      // Get updated conversation
      const updatedConversation = await prisma.conversation.findUnique({
        where: { id: conversation.id },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      if (!updatedConversation) {
        console.error('Failed to fetch updated conversation');
        return false;
      }

      // Send Pusher events
      await sendPusherEvents(pusherServer, {
        message: botMessage,
        conversation: updatedConversation
      });

      return true;
    } catch (error) {
      console.error('Error sending LINE message:', error);
      return false;
    }
  }

  async replyMessage(replyToken: string, text: string, userId: string): Promise<boolean> {
    try {
      const message: TextMessage = {
        type: 'text',
        text: text
      };

      // Send reply to LINE first
      await this.client.replyMessage(replyToken, message);

      // Find the conversation for this user
      const conversation = await prisma.conversation.findFirst({
        where: {
          userId: userId,
          platform: 'LINE'
        },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      if (!conversation) {
        console.error('Conversation not found for user:', userId);
        return false;
      }

      // Create bot message in database
      const botMessage = await createMessage(prisma, {
        conversationId: conversation.id,
        content: text,
        sender: 'BOT',
        platform: 'LINE',
        timestamp: new Date(),
        externalId: `bot_reply_${Date.now()}`
      });

      // Get updated conversation
      const updatedConversation = await prisma.conversation.findUnique({
        where: { id: conversation.id },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      if (!updatedConversation) {
        console.error('Failed to fetch updated conversation');
        return false;
      }

      // Send Pusher events
      await sendPusherEvents(pusherServer, {
        message: botMessage,
        conversation: updatedConversation
      });

      return true;
    } catch (error) {
      console.error('Error replying to LINE message:', error);
      return false;
    }
  }
}

export const lineMessageService = new LineMessageService();