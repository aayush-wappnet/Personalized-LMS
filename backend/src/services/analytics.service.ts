import { AppDataSource } from '../config/database';
import { QuizAttempt } from '../entities/QuizAttempt';
import { ModuleProgress } from '../entities/ModuleProgress';
import { Enrollment } from '../entities/Enrollment';

export class AnalyticsService {
  private quizAttemptRepository = AppDataSource.getRepository(QuizAttempt);
  private moduleProgressRepository = AppDataSource.getRepository(ModuleProgress);
  private enrollmentRepository = AppDataSource.getRepository(Enrollment);

  async getCourseAnalytics(courseId: number) {
    // Get all quiz attempts for the course
    const quizAttempts = await this.quizAttemptRepository.find({
      where: { quiz: { module: { course: { id: courseId } } } },
      relations: ['student'],
    });

    // Calculate average quiz score
    const averageQuizScore = quizAttempts.length > 0
      ? quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizAttempts.length
      : 0;

    // Get module progress for the course
    const moduleProgress = await this.moduleProgressRepository.find({
      where: { module: { course: { id: courseId } } },
      relations: ['student'],
    });

    // Calculate module completion rate
    const totalModules = (await AppDataSource.getRepository('Module').count({ where: { course: { id: courseId } } })) * moduleProgress.length;
    const completedModules = moduleProgress.filter(mp => mp.isCompleted).length;
    const moduleCompletionRate = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

    return {
      courseId,
      averageQuizScore,
      moduleCompletionRate,
      totalStudents: new Set(moduleProgress.map(mp => mp.student.id)).size,
    };
  }

  async getStudentAnalytics(userId: number) {
    // Get quiz attempts for the student
    const quizAttempts = await this.quizAttemptRepository.find({
      where: { student: { id: userId } },
      relations: ['quiz'],
    });

    // Get module progress for the student
    const moduleProgress = await this.moduleProgressRepository.find({
      where: { student: { id: userId } },
      relations: ['module'],
    });

    return {
      studentId: userId,
      averageQuizScore: quizAttempts.length > 0
        ? quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizAttempts.length
        : 0,
      completedModules: moduleProgress.filter(mp => mp.isCompleted).length,
      quizAttempts: quizAttempts.map(attempt => ({
        quizId: attempt.quiz.id,
        quizTitle: attempt.quiz.title,
        score: attempt.score,
      })),
    };
  }
}