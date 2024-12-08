import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendLineMessage } from '@/lib/lineClient';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, content, platform } = body;

    // Create bot message in database
    const message = await prisma.message.create({
      data: {
        conversationId,
        content,
        sender: 'BOT',
        platform,
      },
    });

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Send message to appropriate platform
    if (platform === 'LINE') {
      await sendLineMessage(conversation.userId, content);
    }

    if (conversation && global.io) {
      global.io.emit('messageReceived', conversation);
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}