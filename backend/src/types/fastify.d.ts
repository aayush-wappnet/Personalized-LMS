import { DataSource } from 'typeorm';
import { UserPayload } from './auth';
import { Role } from './role';
import { FastifyReply, FastifyRequest } from 'fastify';
import { MultipartFile } from '@fastify/multipart'; // Use MultipartFile
import { CourseService } from '../services/course.service';

declare module 'fastify' {
  interface FastifyInstance {
    db: DataSource;
    verifyJWT: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    cloudinary: any; // Placeholder for Cloudinary instance
    courseService: CourseService; // Add courseService to FastifyInstance
  }

  interface FastifyRequest {
    file?: MultipartFile; // Update to MultipartFile
    user?: UserPayload; // Use UserPayload for consistency
  }

  interface FastifyContextConfig {
    requiredRole?: Role;
  }
}