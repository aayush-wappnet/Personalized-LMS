import { FastifyRequest, FastifyReply } from 'fastify';
import { AnalyticsService } from '../services/analytics.service';
import { Role } from '../types/role';

export const getCourseAnalytics = async (request: FastifyRequest<{ Params: { courseId: number } }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.INSTRUCTOR && user.role !== Role.ADMIN) {
      throw new Error('Only instructors or admins can view course analytics');
    }
    const analyticsService = new AnalyticsService();
    const analytics = await analyticsService.getCourseAnalytics(request.params.courseId);
    reply.send(analytics);
  } catch (err: any) {
    reply.code(404).send({ error: err.message });
  }
};

export const getStudentAnalytics = async (request: FastifyRequest<{ Params: { userId: number } }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.INSTRUCTOR && user.role !== Role.ADMIN) {
      throw new Error('Only instructors or admins can view student analytics');
    }
    const analyticsService = new AnalyticsService();
    const analytics = await analyticsService.getStudentAnalytics(request.params.userId);
    reply.send(analytics);
  } catch (err: any) {
    reply.code(404).send({ error: err.message });
  }
};

export const getDashboardStats = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    const analyticsService = new AnalyticsService();
    const stats = await analyticsService.getDashboardStats(user.id, user.role);
    reply.send(stats);
  } catch (err: any) {
    reply.code(403).send({ error: err.message });
  }
};