import { FastifyPluginAsync } from 'fastify';
import { getNotifications, markAsRead } from '../controllers/notification.controller';
import { authGuard } from '../middlewares/auth.guard'; // Import authGuard

const notificationRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/notifications', {
    preHandler: authGuard,
    config: { requiredRole: undefined }, // All roles can view notifications
    handler: getNotifications,
  });

  fastify.put('/notifications/:id/read', {
    preHandler: authGuard,
    config: { requiredRole: undefined }, // All roles can mark their notifications as read
    handler: markAsRead,
  });
};

export default notificationRoutes;