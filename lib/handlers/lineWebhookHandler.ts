import type { PrismaClient } from '@prisma/client';
import type { default as PusherType } from 'pusher';
import type { LineTextMessageEvent } from '@/app/types/line';
import type { LineMessageService } from '../services/lineMessageService';
import { findOrCreateConversation } from '../services/conversationService';
import { createMessage } from '../services/messageService';
import { sendPusherEvents } from '../services/pusherService';
import { handleDuplicateMessage } from '../services/messageValidationService';
import { getChannelId, getUserId } from '../utils/lineUtils';

export async function handleLineMessage(
  event: LineTextMessageEvent,
  prisma: PrismaClient,
  lineService: LineMessageService,
  pusherServer: PusherType
) {
  try {
    const { source } = event;
    const { text, id: messageId } = event.message;
    const timestamp = new Date(event.timestamp);
    
    const userId = getUserId(source);
    if (!userId) {
      console.error('User ID not found in event source');
      return;
    }

    const channelId = getChannelId(source);

    // Check for duplicate message
    const isDuplicate = await handleDuplicateMessage(prisma, messageId);
    if (isDuplicate) {
      console.log('Skipping duplicate message:', messageId);
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

    // Get updated conversation with the new user message
    let updatedConversation = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!updatedConversation) {
      throw new Error('Failed to fetch updated conversation');
    }

    // Send Pusher events for user message
    await sendPusherEvents(pusherServer, {
      message: userMessage,
      conversation: updatedConversation
    });

    // Send automatic reply
    const replyText = 'ระบบได้รับข้อความของคุณแล้ว';
    const replySuccess = await lineService.replyMessage(event.replyToken, replyText);

    if (!replySuccess) {
      console.error('Failed to send LINE reply');
      return;
    }

    // Create bot message with a slight delay
    const botMessage = await createMessage(prisma, {
      conversationId: conversation.id,
      content: replyText,
      sender: 'BOT',
      platform: 'LINE',
      timestamp: new Date(Date.now() + 1000) // Add 1 second to ensure proper ordering
    });

    // Get final conversation state
    updatedConversation = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!updatedConversation) {
      throw new Error('Failed to fetch final conversation state');
    }

    // Send Pusher events for bot message
    await sendPusherEvents(pusherServer, {
      message: botMessage,
      conversation: updatedConversation
    });

  } catch (error) {
    console.error('Error handling LINE message:', error);
    throw error;
  }
}