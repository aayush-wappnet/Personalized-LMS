import { FastifyRequest, FastifyReply } from 'fastify';
import { QuizService } from '../services/quiz.service';
import { Role } from '../types/role';

export const createQuiz = async (request: FastifyRequest<{ Body: { title: string; description?: string; moduleId: number } }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.INSTRUCTOR && user.role !== Role.ADMIN) {
      throw new Error('Only instructors or admins can create quizzes');
    }
    const quizService = new QuizService(request.server);
    const quiz = await quizService.createQuiz(user.id, request.body);
    reply.code(201).send({ id: quiz.id, message: 'Quiz created successfully' });
  } catch (err: any) {
    reply.code(400).send({ error: err.message });
  }
};

export const getQuizzes = async (request: FastifyRequest<{ Params: { moduleId: number } }>, reply: FastifyReply) => {
  try {
    const quizService = new QuizService(request.server);
    const quizzes = await quizService.getQuizzes(request.params.moduleId);
    reply.send(quizzes);
  } catch (err: any) {
    reply.code(404).send({ error: err.message });
  }
};

export const updateQuiz = async (request: FastifyRequest<{ Params: { id: number }; Body: { title?: string; description?: string; moduleId?: number } }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.INSTRUCTOR && user.role !== Role.ADMIN) {
      throw new Error('Only instructors or admins can update quizzes');
    }
    const quizService = new QuizService(request.server);
    const quiz = await quizService.updateQuiz(request.params.id, request.body);
    reply.send({ id: quiz.id, message: 'Quiz updated successfully' });
  } catch (err: any) {
    reply.code(400).send({ error: err.message });
  }
};

export const deleteQuiz = async (request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.INSTRUCTOR && user.role !== Role.ADMIN) {
      throw new Error('Only instructors or admins can delete quizzes');
    }
    const quizService = new QuizService(request.server);
    await quizService.deleteQuiz(request.params.id);
    reply.send({ message: 'Quiz deleted successfully' });
  } catch (err: any) {
    reply.code(400).send({ error: err.message });
  }
};

export const addQuestion = async (request: FastifyRequest<{ Params: { id: number }; Body: { questionText: string; options: { id: number; text: string; isCorrect: boolean }[] } }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.INSTRUCTOR && user.role !== Role.ADMIN) {
      throw new Error('Only instructors or admins can add questions');
    }
    const quizService = new QuizService(request.server);
    const question = await quizService.addQuestion(request.params.id, request.body);
    reply.code(201).send({ id: question.id, message: 'Question added successfully' });
  } catch (err: any) {
    reply.code(400).send({ error: err.message });
  }
};