import { AppDataSource } from '../config/database';
import { QuizAttempt } from '../entities/QuizAttempt';
import { Question } from '../entities/Question';
import { User } from '../entities/User';
import { Quiz } from '../entities/Quiz';
import { ModuleProgressService } from './moduleProgress.service';
import { NotificationService } from './notification.service'; // Import NotificationService
import { FastifyInstance } from 'fastify';

export class QuizAttemptService {
  private quizAttemptRepository = AppDataSource.getRepository(QuizAttempt);
  private questionRepository = AppDataSource.getRepository(Question);
  private userRepository = AppDataSource.getRepository(User);
  private fastify: FastifyInstance | null = null;

  constructor(fastify?: FastifyInstance) {
    if (fastify) {
      this.fastify = fastify;
    }
  }

  async submitQuizAttempt(userId: number, quizId: number, answers: { questionId: number; selectedOptionId: number }[]) {
    const quiz = await AppDataSource.getRepository(Quiz).findOneOrFail({ where: { id: quizId }, relations: ['questions', 'module'] });
    const user = await this.userRepository.findOneOrFail({ where: { id: userId } });

    let score = 0;
    const totalQuestions = quiz.questions.length;
    const evaluatedAnswers = answers.map(answer => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (!question) return { ...answer, isCorrect: false };
      const selectedOption = question.options.find(o => o.id === answer.selectedOptionId);
      const isCorrect = selectedOption?.isCorrect || false;
      if (isCorrect) score += 100 / totalQuestions;
      return { ...answer, isCorrect };
    });

    const attempt = this.quizAttemptRepository.create({
      answers: evaluatedAnswers,
      score,
      student: user,
      quiz,
    });
    const savedAttempt = await this.quizAttemptRepository.save(attempt);

    // Gamification: Award points and badges
    user.points = (user.points || 0) + 10; // Award 10 points for submitting a quiz
    let badges: string[] = user.badges ? JSON.parse(user.badges) : [];
    if (score === 100 && !badges.includes('Quiz Master')) {
      badges.push('Quiz Master');
      user.badges = JSON.stringify(badges);
      // Notify user about the badge
      if (this.fastify) {
        const notificationService = new NotificationService(this.fastify);
        await notificationService.createNotification(
          user.id,
          'Congratulations! You earned the "Quiz Master" badge for scoring 100 on a quiz!',
          'Badge',
          null
        );
      }
    }
    await this.userRepository.save(user);

    // Update module progress
    const moduleProgressService = new ModuleProgressService();
    await moduleProgressService.updateModuleProgress(userId, quiz.module.id, {
      progressPercentage: Math.min((savedAttempt.score / 100) * 100, 100),
      isCompleted: savedAttempt.score >= 80,
    });

    return {
      id: savedAttempt.id,
      answers: savedAttempt.answers,
      score: savedAttempt.score,
      createdAt: savedAttempt.createdAt,
      student: {
        id: user.id,
        userName: user.userName,
      },
      quiz: {
        id: quiz.id,
        title: quiz.title,
      },
    };
  }

  async getQuizAttempts(quizId: number) {
    const attempts = await this.quizAttemptRepository.find({ where: { quiz: { id: quizId } }, relations: ['student'] });
    return attempts.map(attempt => ({
      id: attempt.id,
      answers: attempt.answers,
      score: attempt.score,
      createdAt: attempt.createdAt,
      student: {
        id: attempt.student.id,
        userName: attempt.student.userName,
      },
    }));
  }
}