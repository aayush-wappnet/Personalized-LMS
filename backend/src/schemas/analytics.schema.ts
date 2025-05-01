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

export const GetDashboardStatsSchema = {
  // No params or querystring needed for this endpoint
};

export const GetTopInstructorSchema = {
  // No params or querystring needed for this endpoint
};

export const GetTopStudentSchema = {
  // No params or querystring needed for this endpoint
};