import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendLineMessage } from '@/lib/lineClient';
import { sendFacebookMessage } from '@/lib/facebookClient';
import { SendMessageRequest } from '@/app/types/chat';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body: SendMessageRequest = await request.json();
    const { conversationId, content, platform } = body;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: true
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    try {
      if (platform === 'LINE') {
        await sendLineMessage(conversation.userId, content);
      } else if (platform === 'FACEBOOK') {
        await sendFacebookMessage(conversation.userId, content);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      return NextResponse.json({ error: 'Failed to send message to platform' }, { status: 500 });
    }

    await prisma.message.create({
      data: {
        conversationId,
        content,
        sender: 'BOT',
        platform,
      }
    });

    const updatedConversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    return NextResponse.json(updatedConversation);
  } catch (error) {
    console.error('Error in message route:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}