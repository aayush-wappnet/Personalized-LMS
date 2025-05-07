import { FastifyRequest, FastifyReply } from 'fastify';
import { RecommendationService } from '../services/recommendation.service';
import { Role } from '../types/role';

export const getCourseRecommendations = async (request: FastifyRequest<{ Params: { courseId: number } }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.STUDENT) {
      throw new Error('Only students can access course recommendations');
    }

    const recommendationService = new RecommendationService();
    const recommendations = await recommendationService.getCourseRecommendations(request.params.courseId);
    reply.send(recommendations);
  } catch (err: any) {
    reply.code(404).send({ error: err.message });
  }
};