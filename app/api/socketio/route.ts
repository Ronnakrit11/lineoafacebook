import { Server } from 'socket.io';
import { NextApiResponseServerIO } from '@/app/types/socket';
import { NextRequest } from 'next/server';

const ioHandler = (req: NextRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: '/api/socketio',
      addTrailingSlash: false,
    });

    res.socket.server.io = io;
  }

  res.end();
};

export const GET = ioHandler;