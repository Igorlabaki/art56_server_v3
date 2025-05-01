import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';

export const setupSocket = (app: express.Application) => {
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Usuário conectado:', socket.id);

    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      console.log(`Usuário ${socket.id} entrou na sala ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log('Usuário desconectado:', socket.id);
    });
  });

  return { httpServer, io };
}; 