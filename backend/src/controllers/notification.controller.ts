import { FastifyRequest, FastifyReply } from 'fastify';
import { Role } from '../types/role';

export const getNotifications = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    const notifications = await request.server.notificationService.getNotifications(user.id);
    reply.send(notifications);
  } catch (err: any) {
    reply.code(400).send({ error: err.message });
  }
};

export const markAsRead = async (request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    const notification = await request.server.notificationService.markAsRead(request.params.id, user.id);
    reply.send({ message: 'Notification marked as read', notification });
  } catch (err: any) {
    reply.code(400).send({ error: err.message });
  }
};