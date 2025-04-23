import { Static, Type } from '@sinclair/typebox';
import { Role } from '../types/role';

export const CreateCourseSchema = Type.Object({
  body: Type.Object({
    title: Type.String(),
    description: Type.String(),
    thumbnail: Type.Optional(Type.Any()), // Handled by Multer
  }),
});

export const GetCoursesSchema = Type.Object({
  query: Type.Object({
    role: Type.Optional(Type.Enum(Role)),
  }),
});

export const EnrollCourseSchema = Type.Object({
  body: Type.Object({
    courseId: Type.Number(),
  }),
});