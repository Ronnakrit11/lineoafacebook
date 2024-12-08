import type { WebhookEvent } from '@line/bot-sdk';
import { PrismaClient } from '@prisma/client';
import { isTextMessageEvent } from '@/app/types/line';
import { lineClient } from '../lineClient';
import { pusherServer } from '../pusher';
import { handleLineMessage } from './lineMessageHandler';

const prisma = new PrismaClient();

export async function handleLineWebhook(event: WebhookEvent) {
  try {
    if (!isTextMessageEvent(event)) {
      console.log('Skipping non-text message event');
      return;
    }

    const result = await handleLineMessage(event, prisma, lineClient, pusherServer);
    return result;
  } catch (error) {
    console.error('Error in LINE webhook handler:', error);
    throw error;
  }
}