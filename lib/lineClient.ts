import { Client } from '@line/bot-sdk';
import { PrismaClient } from '@prisma/client';

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

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: text,
        sender: 'USER',
        platform: 'LINE'
      }
    });

    return lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: 'ระบบได้รับข้อความของคุณแล้ว'
    });
  }
}