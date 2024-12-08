import { Client } from '@line/bot-sdk';
import { PrismaClient } from '@prisma/client';
import { pusherServer, PUSHER_EVENTS, PUSHER_CHANNELS } from './pusher';
import { formatMessageForPusher, formatConversationForPusher } from './messageFormatter';

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
  if (event.type !== 'message' || event.message.type !== 'text') {
    return; // Only handle text messages
  }

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
  const newMessage = await prisma.message.create({
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

  if (updatedConversation) {
    // Trigger Pusher events with optimized payloads
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
  }

  // We're removing the automatic reply here
  // Only send replies when explicitly requested through the chat interface
}

export async function sendLineMessage(userId: string, message: string) {
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