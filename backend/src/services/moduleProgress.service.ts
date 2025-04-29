import { AppDataSource } from '../config/database';
import { ModuleProgress } from '../entities/ModuleProgress';
import { User } from '../entities/User';
import { NotificationService } from './notification.service'; // Import NotificationService
import { FastifyInstance } from 'fastify';

export class ModuleProgressService {
  private moduleProgressRepository = AppDataSource.getRepository(ModuleProgress);
  private userRepository = AppDataSource.getRepository(User);
  private fastify: FastifyInstance | null = null;

  constructor(fastify?: FastifyInstance) {
    if (fastify) {
      this.fastify = fastify;
    }
  }

  async getModuleProgress(userId: number, moduleId: number) {
    return this.moduleProgressRepository.findOne({
      where: { student: { id: userId }, module: { id: moduleId } },
    });
  }

  async updateModuleProgress(userId: number, moduleId: number, data: { progressPercentage?: number; isCompleted?: boolean }) {
    let progress = await this.moduleProgressRepository.findOne({ where: { student: { id: userId }, module: { id: moduleId } } });
    if (!progress) {
      progress = this.moduleProgressRepository.create({ student: { id: userId }, module: { id: moduleId } });
    }
    Object.assign(progress, data);
    const savedProgress = await this.moduleProgressRepository.save(progress);

    // Gamification: Award points and badges for module completion
    if (savedProgress.isCompleted) {
      const user = await this.userRepository.findOneOrFail({ where: { id: userId } });
      user.points = (user.points || 0) + 50; // Award 50 points for completing a module
      let badges: string[] = user.badges ? JSON.parse(user.badges) : [];
      if (!badges.includes('Module Finisher')) {
        badges.push('Module Finisher');
        user.badges = JSON.stringify(badges);
        // Notify user about the badge
        if (this.fastify) {
          const notificationService = new NotificationService(this.fastify);
          await notificationService.createNotification(
            user.id,
            'Congratulations! You earned the "Module Finisher" badge for completing your first module!',
            'Badge',
            moduleId
          );
        }
      }
      await this.userRepository.save(user);
    }

    return savedProgress;
  }
}