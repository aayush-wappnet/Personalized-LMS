import { Type } from '@sinclair/typebox';
import { Role } from '../types/role';

export const CreateQuizSchema = {
  body: Type.Object({
    title: Type.String(),
    description: Type.Optional(Type.String()),
    moduleId: Type.Number(), // Remains as moduleId for input
  }),
};

export const UpdateQuizSchema = {
  params: Type.Object({
    id: Type.Number(),
  }),
  body: Type.Object({
    title: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    moduleId: Type.Optional(Type.Number()), // Remains optional for updates
  }),
};

export const DeleteQuizSchema = {
  params: Type.Object({
    id: Type.Number(),
  }),
};

export const GetQuizzesSchema = {
  params: Type.Object({
    moduleId: Type.Number(),
  }),
};