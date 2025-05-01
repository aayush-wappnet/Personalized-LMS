import { FastifyPluginAsync } from 'fastify';
import { GetCourseAnalyticsSchema, GetStudentAnalyticsSchema, GetDashboardStatsSchema } from '../schemas/analytics.schema';
import { getCourseAnalytics, getStudentAnalytics, getDashboardStats } from '../controllers/analytics.controller';
import { authGuard } from '../middlewares/auth.guard';
import { Role } from '../types/role';

const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/analytics/course/:courseId', {
    schema: GetCourseAnalyticsSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR }, // Fixed: Role.INSTRUCTOR && Role.ADMIN is incorrect
    handler: getCourseAnalytics,
  });

  fastify.get('/analytics/student/:userId', {
    schema: GetStudentAnalyticsSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR }, // Fixed: Role.INSTRUCTOR && Role.ADMIN is incorrect
    handler: getStudentAnalytics,
  });

  fastify.get('/analytics/dashboard', {
    schema: GetDashboardStatsSchema,
    preHandler: authGuard,
    config: { requiredRole: undefined }, // Both Admin and Instructor can access, handled in controller
    handler: getDashboardStats,
  });
};

export default analyticsRoutes;