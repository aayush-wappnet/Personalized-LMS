import { Type } from '@sinclair/typebox';

export const GetCourseRecommendationsSchema = {
  params: Type.Object({
    courseId: Type.Number(),
  }),
};