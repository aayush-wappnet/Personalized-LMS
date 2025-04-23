import { Type } from '@sinclair/typebox';
import { Role } from '../types/role';

export const CreateCourseSchema = {
  body: Type.Object({
    title: Type.String(),
    description: Type.String(),
    thumbnail: Type.Optional(Type.Any()), // Handled as multipart
  }),
};

export const UpdateCourseSchema = {
  params: Type.Object({
    id: Type.Number(),
  }),
  body: Type.Object({
    title: Type.String(),
    description: Type.String(),
    thumbnail: Type.Optional(Type.Any()), // Handled as multipart
  }),
};

export const DeleteCourseSchema = {
  params: Type.Object({
    id: Type.Number(),
  }),
};

export const GetCoursesSchema = {
  querystring: Type.Object({ // Changed from 'query' to 'querystring'
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
  querystring: Type.Object({ // Changed from 'query' to 'querystring'
    status: Type.Enum({ APPROVED: 'APPROVED', REJECTED: 'REJECTED' }),
  }),
};

export const EnrollCourseSchema = {
  body: Type.Object({
    courseId: Type.Number(),
  }),
};