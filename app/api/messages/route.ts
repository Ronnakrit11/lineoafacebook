import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendLineMessage } from '@/lib/lineClient';
import { sendFacebookMessage } from '@/lib/facebookClient';
import { pusherServer, PUSHER_EVENTS, PUSHER_CHANNELS } from '@/lib/pusher';
import { formatMessageForPusher, formatConversationForPusher } from '@/lib/messageFormatter';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, content, platform } = body;

    if (!conversationId || !content || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get conversation first to ensure it exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Send message to platform first
    let messageSent = false;
    if (platform === 'LINE') {
      messageSent = await sendLineMessage(conversation.userId, content);
    } else if (platform === 'FACEBOOK') {
      messageSent = await sendFacebookMessage(conversation.userId, content);
    }

    if (!messageSent) {
      return NextResponse.json(
        { error: 'Failed to send message to platform' },
        { status: 500 }
      );
    }

    // Create bot message in database
    const newMessage = await prisma.message.create({
      data: {
        conversationId,
        content,
        sender: 'BOT',
        platform,
      },
    });

    // Get updated conversation
    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, newMessage]
    };

    // Trigger Pusher events
    await Promise.all([
      pusherServer.trigger(
        PUSHER_CHANNELS.CHAT,
        PUSHER_EVENTS.MESSAGE_RECEIVED,
        formatMessageForPusher(newMessage)
      ),
      pusherServer.trigger(
        PUSHER_CHANNELS.CHAT,
        PUSHER_EVENTS.CONVERSATION_UPDATED,
        formatConversationForPusher(updatedConversation)
      ),
    ]);

    return NextResponse.json(updatedConversation);
  } catch (error) {
    console.error('Error handling message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}