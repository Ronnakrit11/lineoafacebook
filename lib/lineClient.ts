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
    id: string;
  };
  source: {
    userId: string;
    roomId?: string;
    groupId?: string;
  };
  replyToken: string;
  timestamp: number;
}

export async function handleLineWebhook(event: LineMessageEvent) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }

  const userId = event.source.userId;
  const text = event.message.text;
  const messageId = event.message.id;
  const timestamp = new Date(event.timestamp);

  // Check if message already exists
  const existingMessage = await prisma.message.findFirst({
    where: {
      externalId: messageId,
      platform: 'LINE'
    }
  });

  if (existingMessage) {
    console.log('Duplicate message detected, skipping:', messageId);
    return;
  }

  let conversation = await prisma.conversation.findFirst({
    where: {
      userId: userId,
      platform: 'LINE'
    },
    include: {
      messages: {
        orderBy: { timestamp: 'asc' }
      }
    }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        userId: userId,
        platform: 'LINE',
        channelId: event.source.roomId || event.source.groupId || userId
      },
      include: {
        messages: true
      }
    });
  }

  // Create user message with external ID
  const newMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      content: text,
      sender: 'USER',
      platform: 'LINE',
      externalId: messageId,
      timestamp
    }
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
    )
  ]);
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