import type { PrismaClient, Platform } from '@prisma/client';

interface ConversationParams {
  userId: string;
  platform: Platform;
  channelId: string;
}

export async function findOrCreateConversation(
  prisma: PrismaClient,
  params: ConversationParams
) {
  const { userId, platform, channelId } = params;

  let conversation = await prisma.conversation.findFirst({
    where: {
      userId,
      platform
    },
    include: {
      messages: {
        orderBy: { timestamp: 'asc' }
      }
    }
  });

  if (!conversation) {
    const newConversation = await prisma.conversation.create({
      data: {
        userId,
        platform,
        channelId
      }
    });

    conversation = {
      ...newConversation,
      messages: []
    };
  }

  return conversation;
}