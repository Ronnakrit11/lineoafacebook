import type { LineSource } from '@/app/types/line';

export function getChannelId(source: LineSource): string {
  switch (source.type) {
    case 'room':
      return source.roomId;
    case 'group':
      return source.groupId;
    case 'user':
      return source.userId;
    default:
      // This helps TypeScript narrow down the type
      const _exhaustiveCheck: never = source;
      throw new Error(`Unhandled source type: ${(_exhaustiveCheck as LineSource).type}`);
  }
}

export function getUserId(source: LineSource): string | undefined {
  return source.userId;
}
