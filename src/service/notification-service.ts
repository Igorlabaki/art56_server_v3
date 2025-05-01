import { Server } from 'socket.io';
import { NotificationType } from '@prisma/client';

export class NotificationService {
  constructor(private io: Server) {}

  async sendProposalNotification(venueId: string, proposalId: string, content: string) {
    const notification = {
      venueId,
      proposalId,
      content,
      type: 'PROPOSAL' as NotificationType,
      isRead: false,
      createdAt: new Date()
    };

    // Envia a notificação para todos os usuários na sala do venue
    this.io.to(venueId).emit('new-notification', notification);
  }
} 