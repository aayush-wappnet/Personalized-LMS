import { DataSource } from 'typeorm';
import { UserPayload } from './auth';
import { Role } from './role';
import { FastifyReply, FastifyRequest } from 'fastify';
import { MultipartFile } from '@fastify/multipart';
import { CourseService } from '../services/course.service';
import { ModuleService } from '../services/module.service'; // Add ModuleService
import { ContentService } from '../services/content.service'; // Add ContentService
import { NotificationService } from '../services/notification.service'; // Add NotificationService

declare module 'fastify' {
  interface FastifyInstance {
    db: DataSource;
    verifyJWT: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    cloudinary: any;
    emailTransporter: any; // Add emailTransporter
    websocketClients: Map<number, Set<WebSocket>>; // Add websocketClients
    courseService: CourseService;
    moduleService: ModuleService; // Add moduleService
    contentService: ContentService; // Add contentService
    notificationService: NotificationService; // Add notificationService
    quizService: QuizService; // Add this
    quizAttemptService: QuizAttemptService; // Add this
    moduleProgressService: ModuleProgressService; // Add this
    enrollmentService: EnrollmentService; // Add this
  }

  interface FastifyRequest {
    file?: MultipartFile;
    user?: UserPayload;
  }

  interface FastifyContextConfig {
    requiredRole?: Role;
  }
}