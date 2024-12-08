import { Client } from '@line/bot-sdk';
import { PrismaClient } from '@prisma/client';
import type { SocketServer } from '@/app/types/socket';

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || ''
};

const prisma = new PrismaClient();
export const lineClient = new Client(lineConfig);

interface LineMessageEvent {
  type: string;
  message: {
    type: string;
    text: string;
  };
  source: {
    userId: string;
    roomId?: string;
    groupId?: string;
  };
  replyToken: string;
}

export async function handleLineWebhook(event: LineMessageEvent) {
  if (event.type === 'message' && event.message.type === 'text') {
    const userId = event.source.userId;
    const text = event.message.text;
    
    let conversation = await prisma.conversation.findFirst({
      where: {
        userId: userId,
        platform: 'LINE'
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId: userId,
          platform: 'LINE',
          channelId: event.source.roomId || event.source.groupId || userId
        }
      });
    }

    // Create user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: text,
        sender: 'USER',
        platform: 'LINE'
      }
    });

    // Get updated conversation with all messages
    const updatedConversation = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    // Emit the message received event with the updated conversation
    const io = global.io as SocketServer | undefined;
    if (updatedConversation && io) {
      console.log('Emitting messageReceived event:', updatedConversation);
      io.emit('messageReceived', updatedConversation);
    }

    // Send automatic reply
    await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: 'ระบบได้รับข้อความของคุณแล้ว'
    });
  }
}

export async function sendLineMessage(userId: string, message: string) {
  try {
    await lineClient.pushMessage(userId, {
      type: 'text',
      text: message
    });
    return true;
  } catch (error) {
    console.error('Error sending LINE message:', error);
    return false;
  }
}