import type { Client } from '@line/bot-sdk';
import type { PrismaClient } from '@prisma/client';
import type { default as PusherType } from 'pusher';
import type { LineTextMessageEvent } from '@/app/types/line';
import { PUSHER_EVENTS, PUSHER_CHANNELS } from '../pusher';
import { formatMessageForPusher, formatConversationForPusher } from '../messageFormatter';
import { findOrCreateConversation } from '../services/conversationService';
import { createMessage } from '../services/messageService';
import { sendPusherEvents } from '../services/pusherService';

export async function handleLineMessage(
  event: LineTextMessageEvent,
  prisma: PrismaClient,
  lineClient: Client,
  pusherServer: PusherType
) {
  try {
    const { userId } = event.source;
    const { text, id: messageId } = event.message;
    const timestamp = new Date(event.timestamp);
    const channelId = event.source.roomId || event.source.groupId || userId;

    // Check for duplicate message
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

    // Get or create conversation
    const conversation = await findOrCreateConversation(prisma, {
      userId,
      platform: 'LINE',
      channelId
    });

    // Create user message
    const userMessage = await createMessage(prisma, {
      conversationId: conversation.id,
      content: text,
      sender: 'USER',
      platform: 'LINE',
      externalId: messageId,
      timestamp
    });

    // Update conversation with user message
    const conversationWithUserMessage = {
      ...conversation,
      messages: [...conversation.messages, userMessage]
    };

    // Send Pusher events for user message
    await sendPusherEvents(pusherServer, {
      message: userMessage,
      conversation: conversationWithUserMessage
    });

    // Send automatic reply
    const replyText = 'ระบบได้รับข้อความของคุณแล้ว';
    await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: replyText
    });

    // Create bot message
    const botMessage = await createMessage(prisma, {
      conversationId: conversation.id,
      content: replyText,
      sender: 'BOT',
      platform: 'LINE',
      timestamp: new Date()
    });

    // Update conversation with bot message
    const finalConversation = {
      ...conversationWithUserMessage,
      messages: [...conversationWithUserMessage.messages, botMessage]
    };

    // Send Pusher events for bot message
    await sendPusherEvents(pusherServer, {
      message: botMessage,
      conversation: finalConversation
    });

  } catch (error) {
    console.error('Error handling LINE message:', error);
    throw error;
  }
}