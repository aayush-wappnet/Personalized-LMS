import { FastifyPluginAsync } from 'fastify';
import { GetCourseAnalyticsSchema, GetStudentAnalyticsSchema } from '../schemas/analytics.schema';
import { getCourseAnalytics, getStudentAnalytics } from '../controllers/analytics.controller';
import { authGuard } from '../middlewares/auth.guard';
import { Role } from '../types/role';

const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/analytics/course/:courseId', {
    schema: GetCourseAnalyticsSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR && Role.ADMIN},
    handler: getCourseAnalytics,
  });

  fastify.get('/analytics/student/:userId', {
    schema: GetStudentAnalyticsSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR && Role.ADMIN},
    handler: getStudentAnalytics,
  });
};

export default analyticsRoutes;