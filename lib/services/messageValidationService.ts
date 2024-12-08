import type { PrismaClient } from '@prisma/client';

export async function handleDuplicateMessage(
  prisma: PrismaClient,
  messageId: string
): Promise<boolean> {
  const existingMessage = await prisma.message.findFirst({
    where: {
      externalId: messageId,
      platform: 'LINE'
    }
  });

  if (existingMessage) {
    console.log('Duplicate message detected, skipping:', messageId);
    return true;
  }

  return false;
}