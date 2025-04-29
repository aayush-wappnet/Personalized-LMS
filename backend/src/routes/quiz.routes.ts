import { FastifyPluginAsync } from 'fastify';
import { CreateQuizSchema, UpdateQuizSchema, DeleteQuizSchema, GetQuizzesSchema } from '../schemas/quiz.schema';
import { CreateQuestionSchema } from '../schemas/question.schema';
import { createQuiz, getQuizzes, updateQuiz, deleteQuiz, addQuestion } from '../controllers/quiz.controller';
import { authGuard } from '../middlewares/auth.guard';
import { Role } from '../types/role';

const quizRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/quizzes', {
    schema: CreateQuizSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR },
    handler: createQuiz,
  });

  fastify.get('/quizzes/:moduleId', {
    schema: GetQuizzesSchema,
    preHandler: authGuard,
    config: { requiredRole: undefined },
    handler: getQuizzes,
  });

  fastify.put('/quizzes/:id', {
    schema: UpdateQuizSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR },
    handler: updateQuiz,
  });

  fastify.delete('/quizzes/:id', {
    schema: DeleteQuizSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR },
    handler: deleteQuiz,
  });

  fastify.post('/quizzes/:id/questions', {
    schema: CreateQuestionSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR },
    handler: addQuestion,
  });
};

export default quizRoutes;