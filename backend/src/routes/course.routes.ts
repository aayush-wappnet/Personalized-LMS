import { FastifyPluginAsync } from 'fastify';
import { createCourse, getCourses, enrollCourse } from '../controllers/course.controller';
import { authGuard } from '../middlewares/auth.guard';
import { CreateCourseSchema, GetCoursesSchema, EnrollCourseSchema } from '../schemas/course.schema';
import { Role } from '../types/role';

const courseRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/courses', {
    schema: CreateCourseSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR }, // Only instructors can create
    handler: createCourse,
  });

  fastify.get('/courses', {
    schema: GetCoursesSchema,
    preHandler: authGuard,
    config: { requiredRole: undefined }, // All roles can view based on their access
    handler: getCourses,
  });

  fastify.post('/courses/enroll', {
    schema: EnrollCourseSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.STUDENT }, // Only students can enroll
    handler: enrollCourse,
  });
};

export default courseRoutes;