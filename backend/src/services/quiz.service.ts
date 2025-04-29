import { AppDataSource } from '../config/database';
import { Quiz } from '../entities/Quiz';
import { Question } from '../entities/Question';
import { Module } from '../entities/Module';
import { FastifyInstance } from 'fastify';
import { NotificationService } from './notification.service';
import { Enrollment } from '../entities/Enrollment';

export class QuizService {
  private quizRepository = AppDataSource.getRepository(Quiz);
  private questionRepository = AppDataSource.getRepository(Question);
  private moduleRepository = AppDataSource.getRepository(Module);
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async createQuiz(userId: number, data: { title: string; description?: string; moduleId: number }) {
    const module = await this.moduleRepository.findOneOrFail({ where: { id: data.moduleId }, relations: ['course'] });
    const quiz = this.quizRepository.create({
      title: data.title,
      description: data.description,
      module,
    });
    const savedQuiz = await this.quizRepository.save(quiz);

    const notificationService = new NotificationService(this.fastify);
    const courseId = module.course.id;
    const enrollments = await AppDataSource.getRepository(Enrollment).find({
      where: { course: { id: courseId } },
      relations: ['student'],
    });
    for (const enrollment of enrollments) {
      await notificationService.createNotification(
        enrollment.student.id,
        `New quiz "${data.title}" added to ${module.title}`,
        'Quiz',
        savedQuiz.id
      );
    }

    return savedQuiz;
  }

  async getQuizzes(moduleId: number) {
    return this.quizRepository.find({ where: { module: { id: moduleId } }, relations: ['questions'] });
  }

  async updateQuiz(id: number, data: { title?: string; description?: string; moduleId?: number }) {
    const quiz = await this.quizRepository.findOneOrFail({ where: { id }, relations: ['module'] });
    if (data.moduleId) {
      const module = await this.moduleRepository.findOneOrFail({ where: { id: data.moduleId } });
      quiz.module = module;
    }
    if (data.title) quiz.title = data.title;
    if (data.description) quiz.description = data.description;
    return this.quizRepository.save(quiz);
  }

  async deleteQuiz(id: number) {
    const quiz = await this.quizRepository.findOneOrFail({ where: { id } });
    await this.quizRepository.remove(quiz);
    return { message: 'Quiz deleted successfully' };
  }

  async addQuestion(quizId: number, data: { questionText: string; options: { id: number; text: string; isCorrect: boolean }[] }) {
    // Validate that at least one option is correct
    const hasCorrectOption = data.options.some(option => option.isCorrect);
    if (!hasCorrectOption) {
      throw new Error('At least one option must be marked as correct');
    }

    const quiz = await this.quizRepository.findOneOrFail({ where: { id: quizId } });
    const question = this.questionRepository.create({
      questionText: data.questionText,
      options: data.options,
      quiz,
    });
    return this.questionRepository.save(question);
  }
}