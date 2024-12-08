import type { Client } from '@line/bot-sdk';
import type { PrismaClient } from '@prisma/client';
import type { default as PusherType } from 'pusher';
import type { LineTextMessageEvent } from '@/app/types/line';
import { findOrCreateConversation } from '../services/conversationService';
import { createMessage } from '../services/messageService';
import { sendPusherEvents } from '../services/pusherService';
import { handleDuplicateMessage } from '../services/messageValidationService';
import { getChannelId } from '../utils/lineUtils';

export async function handleLineMessage(
  event: LineTextMessageEvent,
  prisma: PrismaClient,
  lineClient: Client,
  pusherServer: PusherType
) {
  try {
    const { source } = event;
    const { text, id: messageId } = event.message;
    const timestamp = new Date(event.timestamp);
    
    if (!source.userId) {
      throw new Error('User ID is required');
    }

    const channelId = getChannelId(source);

    // Check for duplicate message
    const isDuplicate = await handleDuplicateMessage(prisma, messageId);
    if (isDuplicate) return;

    // Get or create conversation
    const conversation = await findOrCreateConversation(prisma, {
      userId: source.userId,
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