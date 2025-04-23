import { AppDataSource } from '../config/database';
import { Module } from '../entities/Module';
import { Course } from '../entities/Course';
import { Enrollment } from '../entities/Enrollment';
import { FastifyInstance } from 'fastify';
import { Role } from '../types/role';
import { NotificationService } from './notification.service';

export class ModuleService {
  private moduleRepository = AppDataSource.getRepository(Module);
  private courseRepository = AppDataSource.getRepository(Course);
  private enrollmentRepository = AppDataSource.getRepository(Enrollment);
  private notificationService: NotificationService;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.notificationService = new NotificationService(fastify);
  }

  async createModule(instructorId: number, data: { courseId: number; title: string; description: string }) {
    const course = await this.courseRepository.findOneOrFail({
      where: { id: data.courseId, instructor: { id: instructorId }, approvalStatus: 'APPROVED' },
      relations: ['instructor'],
    });
    if (!course) throw new Error('Course not found, not approved, or not authorized');

    const module = this.moduleRepository.create({
      title: data.title,
      description: data.description,
      course,
    });
    const savedModule = await this.moduleRepository.save(module);

    // Notify enrolled students about the new module
    const enrollments = await this.enrollmentRepository.find({ where: { course: { id: data.courseId } }, relations: ['student'] });
    for (const enrollment of enrollments) {
      await this.notificationService.createNotification(
        enrollment.student.id,
        `A new module "${module.title}" has been added to the course "${course.title}".`,
        'Module',
        savedModule.id
      );
    }

    return savedModule;
  }

  async getModules(courseId: number) {
    return await this.moduleRepository.find({ where: { course: { id: courseId } }, relations: ['course'] });
  }

  async updateModule(instructorId: number, moduleId: number, data: { title: string; description: string }) {
    const module = await this.moduleRepository.findOneOrFail({
      where: { id: moduleId, course: { instructor: { id: instructorId }, approvalStatus: 'APPROVED' } },
      relations: ['course'],
    });
    module.title = data.title;
    module.description = data.description;
    return await this.moduleRepository.save(module);
  }

  async deleteModule(instructorId: number, moduleId: number) {
    const module = await this.moduleRepository.findOneOrFail({
      where: { id: moduleId, course: { instructor: { id: instructorId }, approvalStatus: 'APPROVED' } },
      relations: ['course'],
    });
    await this.moduleRepository.remove(module);
    return { message: 'Module deleted successfully' };
  }
}