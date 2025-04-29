import { Type } from '@sinclair/typebox';

export const CreateQuestionSchema = {
  body: Type.Object({
    questionText: Type.String(),
    options: Type.Array(
      Type.Object({
        id: Type.Number(),
        text: Type.String(),
        isCorrect: Type.Boolean(),
      })
    ),
  }),
};

export const UpdateQuestionSchema = {
  params: Type.Object({
    id: Type.Number(),
  }),
  body: Type.Object({
    questionText: Type.Optional(Type.String()),
    options: Type.Optional(
      Type.Array(
        Type.Object({
          id: Type.Number(),
          text: Type.String(),
          isCorrect: Type.Boolean(),
        })
      )
    ),
  }),
};

export const DeleteQuestionSchema = {
  params: Type.Object({
    id: Type.Number(),
  }),
};