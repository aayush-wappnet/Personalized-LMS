import { Course } from '../entities/Course';
import { Role } from '../types/role';

export const formatCourseResponse = (course: Course, role?: Role): any => {
  const baseResponse = {
    id: course.id,
    title: course.title,
    description: course.description,
    thumbnailUrl: course.thumbnailUrl,
    instructorId: course.instructor.id,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };

  if (role === Role.ADMIN || role === Role.INSTRUCTOR) {
    return {
      ...baseResponse,
      approvalStatus: course.approvalStatus,
    };
  }

  return baseResponse;
};