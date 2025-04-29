import { Type } from '@sinclair/typebox';

export const GetCourseAnalyticsSchema = {
  params: Type.Object({
    courseId: Type.Number(),
  }),
};

export const GetStudentAnalyticsSchema = {
  params: Type.Object({
    userId: Type.Number(),
  }),
};