import { AppDataSource } from '../config/database';
import { Course } from '../entities/Course';
import { User } from '../entities/User';
import { Enrollment } from '../entities/Enrollment';
import { Role } from '../types/role';
import { FastifyInstance } from 'fastify';
import { MultipartFile } from '@fastify/multipart';
import { formatCourseResponse } from '../utils/course-utils';
import { Readable } from 'stream';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';

export class CourseService {
  private courseRepository = AppDataSource.getRepository(Course);
  private userRepository = AppDataSource.getRepository(User);
  private enrollmentRepository = AppDataSource.getRepository(Enrollment);
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    // console.log('Cloudinary in service:', this.fastify.cloudinary); // Debug decoration
  }

  async createCourse(instructorId: number, data: { title: string; description: string; thumbnail?: MultipartFile | Buffer }) {
    // console.log('Service received data:', data);
    const instructor = await this.userRepository.findOneOrFail({ where: { id: instructorId } });
    if (instructor.role !== Role.INSTRUCTOR && instructor.role !== Role.ADMIN) {
      throw new Error('Only instructors or admins can create courses');
    }

    let thumbnailUrl = '';
    if (data.thumbnail) {
      // console.log('Processing thumbnail. Type:', typeof data.thumbnail);
      if (Buffer.isBuffer(data.thumbnail)) {
        // console.log('Uploading Buffer thumbnail with length:', data.thumbnail.length);
        const stream = new Readable();
        stream.push(data.thumbnail);
        stream.push(null); // End the stream
        try {
          let cloudinaryInstance = this.fastify.cloudinary;
          if (!cloudinaryInstance || !cloudinaryInstance.uploader) {
            // console.warn('Falling back to direct Cloudinary import due to missing decoration');
            cloudinaryInstance = cloudinary; // Fallback to direct import
          }
          const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinaryInstance.uploader.upload_stream(
              { resource_type: 'auto' },
              (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error) reject(error);
                else if (result) resolve(result);
                else reject(new Error('Upload failed with no error or result'));
              }
            );
            stream.pipe(uploadStream);
          });
          thumbnailUrl = uploadResult.secure_url;
          console.log('Thumbnail uploaded from Buffer, URL:', thumbnailUrl);
        } catch (uploadError) {
          console.error('Cloudinary upload failed:', uploadError);
          throw new Error('Failed to upload thumbnail to Cloudinary');
        }
      } else {
        // console.warn('Thumbnail is not a Buffer and no filepath available:', data.thumbnail);
      }
    } else {
      // console.warn('No thumbnail provided for upload');
    }

    const course = this.courseRepository.create({
      title: data.title,
      description: data.description,
      thumbnailUrl: thumbnailUrl,
      instructor,
    });
    console.log('Course object before save:', course);
    return await this.courseRepository.save(course);
  }

  async getCourses(userId: number, role: Role) {
    const user = await this.userRepository.findOneOrFail({ where: { id: userId } });
    let courses: Course[];
    if (role === Role.ADMIN) {
      courses = await this.courseRepository.find({ relations: ['instructor'] });
    } else if (role === Role.INSTRUCTOR) {
      courses = await this.courseRepository.find({ where: { instructor: { id: userId } }, relations: ['instructor'] });
    } else if (role === Role.STUDENT) {
      const enrollments = await this.enrollmentRepository.find({ where: { student: { id: userId } }, relations: ['course', 'course.instructor'] });
      courses = enrollments.map(enrollment => enrollment.course);
    } else {
      throw new Error('Invalid role');
    }
    return courses.map(formatCourseResponse);
  }

  async enrollCourse(studentId: number, courseId: number) {
    const student = await this.userRepository.findOneOrFail({ where: { id: studentId } });
    if (student.role !== Role.STUDENT) {
      throw new Error('Only students can enroll in courses');
    }

    const course = await this.courseRepository.findOneOrFail({ where: { id: courseId } });
    const existingEnrollment = await this.enrollmentRepository.findOne({ where: { student: { id: studentId }, course: { id: courseId } } });
    if (existingEnrollment) throw new Error('Already enrolled');

    const enrollment = this.enrollmentRepository.create({ student, course });
    return await this.enrollmentRepository.save(enrollment);
  }
}