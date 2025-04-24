import { FastifyPluginAsync } from 'fastify';
import {
  CreateCourseSchema,
  GetCoursesSchema,
  EnrollCourseSchema,
  UpdateCourseSchema,
  DeleteCourseSchema,
  GetEnrolledCourseByIdSchema,
  ApproveCourseSchema,
  GetCourseByIdSchema
} from '../schemas/course.schema';
import {
  createCourse,
  getCourses,
  enrollCourse,
  updateCourse,
  deleteCourse,
  getEnrolledCourses,
  getEnrolledCourseById,
  approveCourse,
  getCourseById
} from '../controllers/course.controller';
import { authGuard } from '../middlewares/auth.guard';
import { Role } from '../types/role';

const courseRoutes: FastifyPluginAsync = async (fastify) => {
  // Instructor and Admin: Create course
  fastify.post('/courses', {
    schema: CreateCourseSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR },
    handler: createCourse,
  });

  // Instructor and Admin: Update course
  fastify.put('/courses/:id', {
    schema: UpdateCourseSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR },
    handler: updateCourse,
  });

  // Instructor and Admin: Delete course
  fastify.delete('/courses/:id', {
    schema: DeleteCourseSchema,
    preHandler: authGuard,
    config: { requiredRole: undefined },
    handler: deleteCourse,
  });

  // All roles: Get courses (filtered by role)
  fastify.get('/courses', {
    schema: GetCoursesSchema,
    preHandler: authGuard,
    config: { requiredRole: undefined },
    handler: getCourses,
  });

  // Student: Get specific course by ID
  fastify.get('/courses/:id', {
    schema: GetCourseByIdSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.STUDENT },
    handler: getCourseById,
  });

  // Student: Get enrolled courses
  fastify.get('/courses/enrolled', {
    preHandler: authGuard,
    config: { requiredRole: Role.STUDENT },
    handler: getEnrolledCourses,
  });

  // Student: Get specific enrolled course by ID
  fastify.get('/courses/enrolled/:id', {
    schema: GetEnrolledCourseByIdSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.STUDENT },
    handler: getEnrolledCourseById,
  });

  // Admin: Approve or reject course
  fastify.put('/courses/:id/approve', {
    schema: ApproveCourseSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.ADMIN },
    handler: approveCourse,
  });

  // Student: Enroll in a course
  fastify.post('/courses/enroll', {
    schema: EnrollCourseSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.STUDENT },
    handler: enrollCourse,
  });
};

export default courseRoutes;