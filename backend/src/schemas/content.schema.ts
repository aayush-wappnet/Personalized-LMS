import { Type } from '@sinclair/typebox';

export const CreateContentSchema = {
  body: Type.Object({
    moduleId: Type.Number(),
    title: Type.String(),
    content: Type.String(),
    file: Type.Optional(Type.Any()), // Handled as multipart
  }),
};

export const GetContentsSchema = {
  params: Type.Object({
    moduleId: Type.Number(),
  }),
};

export const UpdateContentSchema = {
  params: Type.Object({
    id: Type.Number(),
  }),
  body: Type.Object({
    title: Type.String(),
    content: Type.String(),
    file: Type.Optional(Type.Any()),
  }),
};

export const DeleteContentSchema = {
  params: Type.Object({
    id: Type.Number(),
  }),
};