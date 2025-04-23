import { Role } from './role';

export interface Course {
  id: number;
  title: string;
  description: string;
  instructorId: number;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseInput {
  title: string;
  description: string;
  thumbnail?: Express.Multer.File; // For file upload
}

export interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  enrolledAt: Date;
}

export interface UserCourseRole {
  userId: number;
  role: Role;
}