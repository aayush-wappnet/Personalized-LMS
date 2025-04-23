import { AppDataSource } from '../config/database';
import { Notification } from '../entities/Notification';
import { User } from '../entities/User';
import { FastifyInstance } from 'fastify';

export class NotificationService {
  private notificationRepository = AppDataSource.getRepository(Notification);
  private userRepository = AppDataSource.getRepository(User);
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async createNotification(recipientId: number, message: string, relatedEntity?: string, relatedEntityId?: number) {
    const recipient = await this.userRepository.findOneOrFail({ where: { id: recipientId } });

    // Create in-app notification
    const notification = this.notificationRepository.create({
      message,
      recipient,
      relatedEntity,
      relatedEntityId,
    });
    await this.notificationRepository.save(notification);

    // Send email notification
    try {
      await this.fastify.emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipient.email,
        subject: 'New Notification from LMS',
        text: message,
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }

    // Send real-time notification via WebSocket
    if (this.fastify.websocketClients?.has(recipientId)) {
      const clients = this.fastify.websocketClients.get(recipientId)!;
      clients.forEach(client => {
        client.send(JSON.stringify({ type: 'notification', message, relatedEntity, relatedEntityId }));
      });
    }
  }

  async getNotifications(userId: number) {
    return await this.notificationRepository.find({
      where: { recipient: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(notificationId: number, userId: number) {
    const notification = await this.notificationRepository.findOneOrFail({
      where: { id: notificationId, recipient: { id: userId } },
    });
    notification.isRead = true;
    return await this.notificationRepository.save(notification);
  }
}