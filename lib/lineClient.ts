import { Client } from '@line/bot-sdk';
import { PrismaClient } from '@prisma/client';
import type { WebhookEvent } from '@line/bot-sdk';
import { isTextMessageEvent } from '@/app/types/line';
import { handleLineMessage } from './handlers/lineMessageHandler';
import { pusherServer } from './pusher';

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || ''
};

const prisma = new PrismaClient();
export const lineClient = new Client(lineConfig);

export async function handleLineWebhook(event: WebhookEvent) {
  if (!isTextMessageEvent(event)) {
    console.log('Skipping non-text message event');
    return;
  }

  await handleLineMessage(event, prisma, lineClient, pusherServer);
}

export async function sendLineMessage(userId: string, message: string): Promise<boolean> {
  if (!userId || !message) {
    console.error('Invalid userId or message');
    return false;
  }

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