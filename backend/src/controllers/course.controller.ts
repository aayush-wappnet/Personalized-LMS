import { FastifyRequest, FastifyReply } from 'fastify';
import { CourseService } from '../services/course.service';
import { Role } from '../types/role';
import { MultipartFile, Multipart } from '@fastify/multipart';
import { Static } from '@sinclair/typebox';
import {
  CreateCourseSchema,
  GetCoursesSchema,
  EnrollCourseSchema,
  UpdateCourseSchema,
  DeleteCourseSchema,
  GetEnrolledCourseByIdSchema,
  ApproveCourseSchema
} from '../schemas/course.schema';

type CreateCourseBody = {
  fields?: {
    title?: { value: string; fields?: any };
    description?: { value: string; fields?: any };
  };
  title?: string;
  description?: string;
  thumbnail?: Buffer | MultipartFile;
};

type UpdateCourseBody = {
  fields?: {
    title?: { value: string; fields?: any };
    description?: { value: string; fields?: any };
  };
  title?: string;
  description?: string;
  thumbnail?: Buffer | MultipartFile;
};

type UpdateCourseParams = Static<typeof UpdateCourseSchema.params>;
type DeleteCourseParams = Static<typeof DeleteCourseSchema.params>;
type GetEnrolledCourseByIdParams = Static<typeof GetEnrolledCourseByIdSchema.params>;
type ApproveCourseParams = Static<typeof ApproveCourseSchema.params>;
type ApproveCourseQuery = Static<typeof ApproveCourseSchema.querystring>; // Use querystring
type GetCoursesQuery = Static<typeof GetCoursesSchema.querystring>; // Use querystring

export const createCourse = async (request: FastifyRequest<{ Body: CreateCourseBody }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.INSTRUCTOR && user.role !== Role.ADMIN) {
      throw new Error('Only instructors or admins can create courses');
    }

    let title: string | undefined;
    let description: string | undefined;
    let thumbnail: MultipartFile | Buffer | undefined;

    if (request.isMultipart()) {
      title = request.body.title;
      description = request.body.description;
      thumbnail = request.body.thumbnail;

      if (Buffer.isBuffer(thumbnail)) {
        console.log('Thumbnail detected as Buffer with length:', thumbnail.length);
      } else if (request.body.fields) {
        title = request.body.fields.title?.value;
        description = request.body.fields.description?.value;
      }

      if (!Buffer.isBuffer(thumbnail)) {
        const parts = request.parts();
        for await (const part of parts) {
          if ('filename' in part && part.filename) {
            thumbnail = part as MultipartFile;
            console.log('File uploaded successfully:', thumbnail.filename);
            break;
          }
        }
      }
    } else {
      title = request.body.title;
      description = request.body.description;
    }

    if (!title || !description) {
      throw new Error('Title and description are required');
    }

    const dataToService = { title: title || '', description: description || '', thumbnail };
    const course = await request.server.courseService.createCourse(user.id, dataToService);
    reply.code(201).send({ id: course.id, message: 'Course created successfully' });
  } catch (err: any) {
    console.error('Error in createCourse:', err);
    reply.code(400).send({ error: err.message });
  }
};

export const updateCourse = async (request: FastifyRequest<{ Params: UpdateCourseParams; Body: UpdateCourseBody }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.INSTRUCTOR && user.role !== Role.ADMIN) {
      throw new Error('Only instructors or admins can update courses');
    }

    let title: string | undefined;
    let description: string | undefined;
    let thumbnail: MultipartFile | Buffer | undefined;

    if (request.isMultipart()) {
      title = request.body.title;
      description = request.body.description;
      thumbnail = request.body.thumbnail;

      if (Buffer.isBuffer(thumbnail)) {
        console.log('Thumbnail detected as Buffer with length:', thumbnail.length);
      } else if (request.body.fields) {
        title = request.body.fields.title?.value;
        description = request.body.fields.description?.value;
      }

      if (!Buffer.isBuffer(thumbnail)) {
        const parts = request.parts();
        for await (const part of parts) {
          if ('filename' in part && part.filename) {
            thumbnail = part as MultipartFile;
            console.log('File uploaded successfully:', thumbnail.filename);
            break;
          }
        }
      }
    } else {
      title = request.body.title;
      description = request.body.description;
    }

    if (!title || !description) {
      throw new Error('Title and description are required');
    }

    const dataToService = { title: title || '', description: description || '', thumbnail };
    const course = await request.server.courseService.updateCourse(user.id, request.params.id, dataToService);
    reply.send({ id: course.id, message: 'Course updated successfully' });
  } catch (err: any) {
    console.error('Error in updateCourse:', err);
    reply.code(400).send({ error: err.message });
  }
};

export const deleteCourse = async (request: FastifyRequest<{ Params: DeleteCourseParams }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    const result = await request.server.courseService.deleteCourse(user.id, request.params.id, user.role);
    reply.send(result);
  } catch (err: any) {
    reply.code(400).send({ error: err.message });
  }
};

export const getCourses = async (request: FastifyRequest<{ Querystring: GetCoursesQuery }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    const { role } = request.query as { role?: Role }; // Cast query to the expected type
    const courses = await request.server.courseService.getCourses(user.id, role || user.role);
    reply.send(courses);
  } catch (err: any) {
    reply.code(403).send({ error: err.message });
  }
};

export const getEnrolledCourses = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.STUDENT) {
      throw new Error('Only students can view enrolled courses');
    }
    const courses = await request.server.courseService.getEnrolledCourses(user.id);
    reply.send(courses);
  } catch (err: any) {
    reply.code(403).send({ error: err.message });
  }
};

export const getEnrolledCourseById = async (request: FastifyRequest<{ Params: GetEnrolledCourseByIdParams }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.STUDENT) {
      throw new Error('Only students can view enrolled courses');
    }
    const course = await request.server.courseService.getEnrolledCourseById(user.id, request.params.id);
    reply.send(course);
  } catch (err: any) {
    reply.code(404).send({ error: err.message });
  }
};

export const approveCourse = async (request: FastifyRequest<{ Params: ApproveCourseParams; Querystring: ApproveCourseQuery }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.ADMIN) {
      throw new Error('Only admins can approve or reject courses');
    }
    const { id } = request.params;
    const { status } = request.query as { status: 'APPROVED' | 'REJECTED' }; // Cast query to the expected type
    const course = await request.server.courseService.approveCourse(user.id, id, status);
    reply.send({ message: `Course ${status.toLowerCase()} successfully`, course });
  } catch (err: any) {
    reply.code(400).send({ error: err.message });
  }
};

export const enrollCourse = async (request: FastifyRequest<{ Body: Static<typeof EnrollCourseSchema.body> }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    const { courseId } = request.body as { courseId: number };
    await request.server.courseService.enrollCourse(user.id, courseId);
    reply.code(200).send({ message: 'Enrolled successfully' });
  } catch (err: any) {
    reply.code(403).send({ error: err.message });
  }
};