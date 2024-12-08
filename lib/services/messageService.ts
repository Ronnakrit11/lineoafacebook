import type { PrismaClient, Platform, SenderType } from '@prisma/client';

interface MessageParams {
  conversationId: string;
  content: string;
  sender: SenderType;
  platform: Platform;
  externalId?: string;
  timestamp: Date;
}

export async function createMessage(
  prisma: PrismaClient,
  params: MessageParams
) {
  const message = await prisma.message.create({
    data: params
  });

  return message;
}