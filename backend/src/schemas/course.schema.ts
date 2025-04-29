import { Type } from '@sinclair/typebox';
import { Role } from '../types/role';

export const CreateCourseSchema = {
  body: Type.Object({
    title: Type.String(),
    description: Type.String(),
    thumbnail: Type.Optional(Type.Any()),
  }),
};

export const UpdateCourseSchema = {
  params: Type.Object({
    id: Type.Number(),
  }),
  body: Type.Object({
    title: Type.String(),
    description: Type.String(),
    thumbnail: Type.Optional(Type.Any()),
  }),
};

export const DeleteCourseSchema = {
  params: Type.Object({
    id: Type.Number(),
  }),
};

export const GetCoursesSchema = {
  querystring: Type.Object({
    role: Type.Optional(Type.Enum(Role)),
  }),
};

export const GetEnrolledCourseByIdSchema = {
  params: Type.Object({
    id: Type.Number(),
  }),
};

export const ApproveCourseSchema = {
  params: Type.Object({
    id: Type.Number(),
  }),
  querystring: Type.Object({
    status: Type.Enum({ APPROVED: 'APPROVED', REJECTED: 'REJECTED' }),
  }),
};

export const EnrollCourseSchema = {
  body: Type.Object({
    courseId: Type.Number(),
  }),
};

export const GetCourseByIdSchema = {
  params: Type.Object({
    id: Type.Number(),
  }),
};

export const MarkCourseCompletedSchema = {
  params: Type.Object({
    courseId: Type.Number(),
  }),
};