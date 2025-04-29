import { FastifyPluginAsync } from 'fastify';
import { SubmitQuizAttemptSchema, GetQuizAttemptsSchema } from '../schemas/quizAttempt.schema';
import { submitQuizAttempt, getQuizAttempts } from '../controllers/quizAttempt.controller';
import { authGuard } from '../middlewares/auth.guard';
import { Role } from '../types/role';

const quizAttemptRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/quiz-attempts', {
    schema: SubmitQuizAttemptSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.STUDENT },
    handler: submitQuizAttempt,
  });

  fastify.get('/quiz-attempts/:quizId', {
    schema: GetQuizAttemptsSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR },
    handler: getQuizAttempts,
  });
};

export default quizAttemptRoutes;