import { Course } from '../entities/Course';

export const formatCourseResponse = (course: Course): any => ({
  id: course.id,
  title: course.title,
  description: course.description,
  thumbnailUrl: course.thumbnailUrl,
  instructorId: course.instructor.id,
  createdAt: course.createdAt,
  updatedAt: course.updatedAt,
});