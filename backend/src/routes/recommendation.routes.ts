import { FastifyPluginAsync } from 'fastify';
import { GetCourseRecommendationsSchema } from '../schemas/recommendation.schema';
import { getCourseRecommendations } from '../controllers/recommendation.controller';
import { authGuard } from '../middlewares/auth.guard';
import { Role } from '../types/role';

const recommendationRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/recommend-courses/:courseId', {
    schema: GetCourseRecommendationsSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.STUDENT },
    handler: getCourseRecommendations,
  });
};

export default recommendationRoutes;