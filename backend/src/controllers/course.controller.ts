import { FastifyRequest, FastifyReply } from 'fastify';
import { CourseService } from '../services/course.service';
import { Role } from '../types/role';
import { MultipartFile, Multipart } from '@fastify/multipart'; // Import Multipart types
import { Static } from '@sinclair/typebox';
import { CreateCourseSchema, GetCoursesSchema, EnrollCourseSchema } from '../schemas/course.schema';

// Type the request body to handle fastify-multipart fields structure
type CreateCourseBody = {
  fields?: {
    title?: { value: string; fields?: any };
    description?: { value: string; fields?: any };
  };
  title?: string;
  description?: string;
  thumbnail?: Buffer | MultipartFile; // Allow Buffer for keyValues case
};

export const createCourse = async (request: FastifyRequest<{ Body: CreateCourseBody }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    let title: string | undefined;
    let description: string | undefined;
    let thumbnail: MultipartFile | Buffer | undefined;

    // Log raw request body to debug
    console.log('Raw Request body:', request.body);

    // Handle form fields from request.body when using multipart
    if (request.isMultipart()) {
      // Check request.body for keyValues case (Buffer)
      title = request.body.title;
      description = request.body.description;
      thumbnail = request.body.thumbnail;

      if (Buffer.isBuffer(thumbnail)) {
        console.log('Thumbnail detected as Buffer with length:', thumbnail.length);
      } else if (request.body.fields) {
        // Fallback for fields object case
        title = request.body.fields.title?.value;
        description = request.body.fields.description?.value;
      }

      // Handle file parts if not already found as Buffer
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
      // Fallback for non-multipart requests
      title = request.body.title;
      description = request.body.description;
    }

    if (!title || !description) {
      throw new Error('Title and description are required');
    }

    if (!thumbnail) {
      console.log('No file uploaded or file processing failed. Request headers:', request.headers, 'Request body:', request.body);
    }

    // Explicitly pass the extracted values to the service
    const dataToService = { title: title || '', description: description || '', thumbnail };
    console.log('Data passed to service:', dataToService);
    const course = await request.server.courseService.createCourse(user.id, dataToService);
    reply.code(201).send({ id: course.id, message: 'Course created successfully' });
  } catch (err: any) {
    console.error('Error in createCourse:', err);
    reply.code(400).send({ error: err.message });
  }
};

export const getCourses = async (request: FastifyRequest<{ Querystring: Static<typeof GetCoursesSchema.query> }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    const { role } = request.query as { role?: Role };
    const courses = await request.server.courseService.getCourses(user.id, role || user.role);
    reply.send(courses);
  } catch (err: any) {
    reply.code(403).send({ error: err.message });
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