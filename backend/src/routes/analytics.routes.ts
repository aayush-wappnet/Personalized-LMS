import { FastifyPluginAsync } from 'fastify';
import { GetCourseAnalyticsSchema, GetStudentAnalyticsSchema, GetDashboardStatsSchema, GetTopInstructorSchema, GetTopStudentSchema } from '../schemas/analytics.schema';
import { getCourseAnalytics, getStudentAnalytics, getDashboardStats, getTopInstructor, getTopStudent } from '../controllers/analytics.controller';
import { authGuard } from '../middlewares/auth.guard';
import { Role } from '../types/role';

const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/analytics/course/:courseId', {
    schema: GetCourseAnalyticsSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR },
    handler: getCourseAnalytics,
  });

  fastify.get('/analytics/student/:userId', {
    schema: GetStudentAnalyticsSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR },
    handler: getStudentAnalytics,
  });

  fastify.get('/analytics/dashboard', {
    schema: GetDashboardStatsSchema,
    preHandler: authGuard,
    config: { requiredRole: undefined },
    handler: getDashboardStats,
  });

  fastify.get('/analytics/top-instructor', {
    schema: GetTopInstructorSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.ADMIN },
    handler: getTopInstructor,
  });

  fastify.get('/analytics/top-student', {
    schema: GetTopStudentSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.ADMIN },
    handler: getTopStudent,
  });
};

export default analyticsRoutes;