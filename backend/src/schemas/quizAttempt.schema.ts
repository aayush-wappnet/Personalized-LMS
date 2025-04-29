import { Type } from '@sinclair/typebox';

export const SubmitQuizAttemptSchema = {
  body: Type.Object({
    quizId: Type.Number(),
    answers: Type.Array(
      Type.Object({
        questionId: Type.Number(),
        selectedOptionId: Type.Number(),
      })
    ),
  }),
};

export const GetQuizAttemptsSchema = {
  params: Type.Object({
    quizId: Type.Number(),
  }),
};