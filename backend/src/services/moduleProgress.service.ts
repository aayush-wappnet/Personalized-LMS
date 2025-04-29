import { AppDataSource } from '../config/database';
import { ModuleProgress } from '../entities/ModuleProgress';

export class ModuleProgressService {
  private moduleProgressRepository = AppDataSource.getRepository(ModuleProgress);

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
    return this.moduleProgressRepository.save(progress);
  }
}