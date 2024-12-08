import type { LineSource } from '@/app/types/line';

export function getChannelId(source: LineSource): string {
  switch (source.type) {
    case 'room':
      return source.roomId;
    case 'group':
      return source.groupId;
    default:
      return source.userId;
  }
}