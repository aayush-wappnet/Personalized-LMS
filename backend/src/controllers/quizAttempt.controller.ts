import { FastifyRequest, FastifyReply } from 'fastify';
import { QuizAttemptService } from '../services/quizAttempt.service';
import { Role } from '../types/role';

export const submitQuizAttempt = async (request: FastifyRequest<{ Body: { quizId: number; answers: { questionId: number; selectedOptionId: number }[] } }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.STUDENT) {
      throw new Error('Only students can submit quiz attempts');
    }
    const quizAttemptService = new QuizAttemptService();
    const attempt = await quizAttemptService.submitQuizAttempt(user.id, request.body.quizId, request.body.answers);
    reply.code(201).send(attempt);
  } catch (err: any) {
    reply.code(400).send({ error: err.message });
  }
};

export const getQuizAttempts = async (request: FastifyRequest<{ Params: { quizId: number } }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.INSTRUCTOR && user.role !== Role.ADMIN) {
      throw new Error('Only instructors or admins can view quiz attempts');
    }
    const quizAttemptService = new QuizAttemptService();
    const attempts = await quizAttemptService.getQuizAttempts(request.params.quizId);
    reply.send(attempts);
  } catch (err: any) {
    reply.code(404).send({ error: err.message });
  }
};