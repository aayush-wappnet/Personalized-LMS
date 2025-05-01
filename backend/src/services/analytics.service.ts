import { AppDataSource } from '../config/database';
import { QuizAttempt } from '../entities/QuizAttempt';
import { ModuleProgress } from '../entities/ModuleProgress';
import { Enrollment } from '../entities/Enrollment';
import { Course } from '../entities/Course';
import { User } from '../entities/User';
import { Role } from '../types/role';

export class AnalyticsService {
  private quizAttemptRepository = AppDataSource.getRepository(QuizAttempt);
  private moduleProgressRepository = AppDataSource.getRepository(ModuleProgress);
  private enrollmentRepository = AppDataSource.getRepository(Enrollment);
  private courseRepository = AppDataSource.getRepository(Course);
  private userRepository = AppDataSource.getRepository(User);

  async getCourseAnalytics(courseId: number) {
    const quizAttempts = await this.quizAttemptRepository.find({
      where: { quiz: { module: { course: { id: courseId } } } },
      relations: ['student'],
    });

    const averageQuizScore = quizAttempts.length > 0
      ? quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizAttempts.length
      : 0;

    const moduleProgress = await this.moduleProgressRepository.find({
      where: { module: { course: { id: courseId } } },
      relations: ['student'],
    });

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
    const quizAttempts = await this.quizAttemptRepository.find({
      where: { student: { id: userId } },
      relations: ['quiz'],
    });

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

  async getDashboardStats(userId: number, role: Role) {
    if (role !== Role.ADMIN && role !== Role.INSTRUCTOR) {
      throw new Error('Only admins and instructors can view dashboard stats');
    }

    const stats: any = {};

    if (role === Role.ADMIN) {
      // Admin stats
      stats.totalCourses = await this.courseRepository.count();
      stats.totalUsers = await this.userRepository.count();
      stats.totalEnrollments = await this.enrollmentRepository.count();
      stats.totalCompletedCourses = await this.enrollmentRepository.count({ where: { isCompleted: true } });
      stats.totalInstructors = await this.userRepository.count({ where: { role: Role.INSTRUCTOR } });
      stats.totalStudents = await this.userRepository.count({ where: { role: Role.STUDENT } });

      // Active users (users with at least one enrollment in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeUsers = await this.enrollmentRepository
        .createQueryBuilder('enrollment')
        .select('COUNT(DISTINCT enrollment.studentId)', 'count')
        .where('enrollment.createdAt >= :date', { date: thirtyDaysAgo })
        .getRawOne();
      stats.activeUsers = parseInt(activeUsers.count, 10) || 0;

      // Course approval status breakdown
      stats.coursesPendingApproval = await this.courseRepository.count({ where: { approvalStatus: 'PENDING' } });
      stats.coursesApproved = await this.courseRepository.count({ where: { approvalStatus: 'APPROVED' } });
      stats.coursesRejected = await this.courseRepository.count({ where: { approvalStatus: 'REJECTED' } });
    } else if (role === Role.INSTRUCTOR) {
      // Instructor stats (scoped to their courses)
      stats.totalCourses = await this.courseRepository.count({ where: { instructor: { id: userId } } });
      stats.totalEnrollments = await this.enrollmentRepository.count({
        where: { course: { instructor: { id: userId } } },
      });
      stats.totalCompletedCourses = await this.enrollmentRepository.count({
        where: { course: { instructor: { id: userId } }, isCompleted: true },
      });

      // Unique students enrolled in their courses
      const enrollments = await this.enrollmentRepository.find({
        where: { course: { instructor: { id: userId } } },
        relations: ['student'],
      });
      stats.totalStudents = new Set(enrollments.map(e => e.student.id)).size;

      // Course approval status breakdown for their courses
      stats.coursesPendingApproval = await this.courseRepository.count({
        where: { instructor: { id: userId }, approvalStatus: 'PENDING' },
      });
      stats.coursesApproved = await this.courseRepository.count({
        where: { instructor: { id: userId }, approvalStatus: 'APPROVED' },
      });
      stats.coursesRejected = await this.courseRepository.count({
        where: { instructor: { id: userId }, approvalStatus: 'REJECTED' },
      });

      // Average quiz score across their courses
      const quizAttempts = await this.quizAttemptRepository.find({
        where: { quiz: { module: { course: { instructor: { id: userId } } } } },
      });
      stats.averageQuizScore = quizAttempts.length > 0
        ? quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizAttempts.length
        : 0;
    }

    return stats;
  }
}