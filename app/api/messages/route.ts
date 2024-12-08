import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSocket } from '@/lib/socket';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, content, platform } = body;

    const message = await prisma.message.create({
      data: {
        conversationId,
        content,
        sender: 'USER',
        platform,
      },
    });

    const updatedConversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (updatedConversation) {
      // Emit the message to all connected clients
      const io = (global as any).io;
      if (io) {
        io.emit('messageReceived', updatedConversation);
      }
    }

    return NextResponse.json(updatedConversation);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}