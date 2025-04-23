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
import { NotificationService } from './notification.service';

export class CourseService {
  private courseRepository = AppDataSource.getRepository(Course);
  private userRepository = AppDataSource.getRepository(User);
  private enrollmentRepository = AppDataSource.getRepository(Enrollment);
  private notificationService: NotificationService;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.notificationService = new NotificationService(fastify);
  }

  async createCourse(instructorId: number, data: { title: string; description: string; thumbnail?: MultipartFile | Buffer }) {
    const instructor = await this.userRepository.findOneOrFail({ where: { id: instructorId } });
    if (instructor.role !== Role.INSTRUCTOR && instructor.role !== Role.ADMIN) {
      throw new Error('Only instructors or admins can create courses');
    }

    let thumbnailUrl = '';
    if (data.thumbnail) {
      if (Buffer.isBuffer(data.thumbnail)) {
        const stream = new Readable();
        stream.push(data.thumbnail);
        stream.push(null);
        try {
          let cloudinaryInstance = this.fastify.cloudinary;
          if (!cloudinaryInstance || !cloudinaryInstance.uploader) {
            cloudinaryInstance = cloudinary;
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
      }
    }

    const course = this.courseRepository.create({
      title: data.title,
      description: data.description,
      thumbnailUrl: thumbnailUrl,
      instructor,
      approvalStatus: 'PENDING',
    });
    const savedCourse = await this.courseRepository.save(course);
    console.log('Course object before save:', course);

    const admins = await this.userRepository.find({ where: { role: Role.ADMIN } });
    for (const admin of admins) {
      await this.notificationService.createNotification(
        admin.id,
        `A new course "${course.title}" by ${instructor.userName} is awaiting approval.`,
        'Course',
        savedCourse.id
      );
    }

    return savedCourse;
  }

  async updateCourse(instructorId: number, courseId: number, data: { title: string; description: string; thumbnail?: MultipartFile | Buffer }) {
    const course = await this.courseRepository.findOneOrFail({
      where: { id: courseId, instructor: { id: instructorId } },
      relations: ['instructor'],
    });

    let thumbnailUrl = course.thumbnailUrl;
    if (data.thumbnail) {
      if (Buffer.isBuffer(data.thumbnail)) {
        const stream = new Readable();
        stream.push(data.thumbnail);
        stream.push(null);
        try {
          let cloudinaryInstance = this.fastify.cloudinary;
          if (!cloudinaryInstance || !cloudinaryInstance.uploader) {
            cloudinaryInstance = cloudinary;
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
          console.log('Thumbnail updated, URL:', thumbnailUrl);
        } catch (uploadError) {
          console.error('Cloudinary upload failed:', uploadError);
          throw new Error('Failed to upload thumbnail to Cloudinary');
        }
      }
    }

    course.title = data.title;
    course.description = data.description;
    course.thumbnailUrl = thumbnailUrl;
    course.approvalStatus = 'PENDING'; // Reset to pending after update
    const updatedCourse = await this.courseRepository.save(course);

    const admins = await this.userRepository.find({ where: { role: Role.ADMIN } });
    for (const admin of admins) {
      await this.notificationService.createNotification(
        admin.id,
        `The course "${course.title}" by ${course.instructor.userName} has been updated and is awaiting approval.`,
        'Course',
        updatedCourse.id
      );
    }

    return updatedCourse;
  }

  async deleteCourse(userId: number, courseId: number, role: Role) {
    const course = await this.courseRepository.findOneOrFail({
      where: { id: courseId, ...(role === Role.INSTRUCTOR ? { instructor: { id: userId } } : {}) },
      relations: ['instructor'],
    });

    if (role === Role.INSTRUCTOR && course.instructor.id !== userId) {
      throw new Error('You can only delete your own courses');
    }
    if (role !== Role.ADMIN && role !== Role.INSTRUCTOR) {
      throw new Error('Only instructors or admins can delete courses');
    }

    await this.courseRepository.remove(course);
    return { message: 'Course deleted successfully' };
  }

  async getCourses(userId: number, role: Role) {
    const user = await this.userRepository.findOneOrFail({ where: { id: userId } });
    let courses: Course[];

    if (role === Role.ADMIN) {
      courses = await this.courseRepository.find({ relations: ['instructor'] });
    } else if (role === Role.INSTRUCTOR) {
      courses = await this.courseRepository.find({ where: { instructor: { id: userId } }, relations: ['instructor'] });
    } else if (role === Role.STUDENT) {
      courses = await this.courseRepository.find({
        where: { approvalStatus: 'APPROVED' },
        relations: ['instructor'],
      });
    } else {
      throw new Error('Invalid role');
    }
    return courses.map(formatCourseResponse);
  }

  async getEnrolledCourses(studentId: number) {
    const user = await this.userRepository.findOneOrFail({ where: { id: studentId } });
    if (user.role !== Role.STUDENT) {
      throw new Error('Only students can view enrolled courses');
    }

    const enrollments = await this.enrollmentRepository.find({
      where: { student: { id: studentId } },
      relations: ['course', 'course.instructor'],
    });
    const courses = enrollments.map(enrollment => enrollment.course);
    return courses.map(formatCourseResponse);
  }

  async getEnrolledCourseById(studentId: number, courseId: number) {
    const user = await this.userRepository.findOneOrFail({ where: { id: studentId } });
    if (user.role !== Role.STUDENT) {
      throw new Error('Only students can view enrolled courses');
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: { student: { id: studentId }, course: { id: courseId } },
      relations: ['course', 'course.instructor'],
    });
    if (!enrollment) {
      throw new Error('Course not found or not enrolled');
    }

    return formatCourseResponse(enrollment.course);
  }

  async approveCourse(adminId: number, courseId: number, status: 'APPROVED' | 'REJECTED') {
    const admin = await this.userRepository.findOneOrFail({ where: { id: adminId } });
    if (admin.role !== Role.ADMIN) {
      throw new Error('Only admins can approve or reject courses');
    }

    const course = await this.courseRepository.findOneOrFail({ where: { id: courseId }, relations: ['instructor'] });
    course.approvalStatus = status;
    const updatedCourse = await this.courseRepository.save(course);

    await this.notificationService.createNotification(
      course.instructor.id,
      `Your course "${course.title}" has been ${status.toLowerCase()} by an admin.`,
      'Course',
      course.id
    );

    return updatedCourse;
  }

  async enrollCourse(studentId: number, courseId: number) {
    const student = await this.userRepository.findOneOrFail({ where: { id: studentId } });
    if (student.role !== Role.STUDENT) {
      throw new Error('Only students can enroll in courses');
    }

    const course = await this.courseRepository.findOneOrFail({
      where: { id: courseId, approvalStatus: 'APPROVED' },
      relations: ['instructor'],
    });
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: { student: { id: studentId }, course: { id: courseId } },
    });
    if (existingEnrollment) throw new Error('Already enrolled');

    const enrollment = this.enrollmentRepository.create({ student, course });
    await this.enrollmentRepository.save(enrollment);

    await this.notificationService.createNotification(
      course.instructor.id,
      `A student (${student.userName}) has enrolled in your course "${course.title}".`,
      'Course',
      course.id
    );

    return { message: 'Enrolled successfully' };
  }
}