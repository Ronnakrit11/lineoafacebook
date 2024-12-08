import { PrismaClient } from '@prisma/client';
import { lineClient } from '@/lib/lineClient';

import type { LineMessageEvent, LineProfile } from '@/app/types/line';

const prisma = new PrismaClient();

async function getLineUserProfile(userId: string): Promise<LineProfile | null> {
  try {
    const profile = await lineClient.getProfile(userId);
    return {
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
    };
  } catch (error) {
    console.error('Error fetching LINE profile:', error);
    return null;
  }
}

export async function handleLineMessage(event: LineMessageEvent): Promise<void> {
  const userId = event.source.userId;
  const text = event.message.text;
  
  let conversation = await prisma.conversation.findFirst({
    where: {
      userId: userId,
      platform: 'LINE'
    }
  });

  if (!conversation) {
    const profile = await getLineUserProfile(userId);
    conversation = await prisma.conversation.create({
      data: {
        userId: userId,
        platform: 'LINE',
        channelId: event.source.roomId || event.source.groupId || userId,
        displayName: profile?.displayName,
        pictureUrl: profile?.pictureUrl,
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

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: 'ระบบได้รับข้อความของคุณแล้ว'
  });
}