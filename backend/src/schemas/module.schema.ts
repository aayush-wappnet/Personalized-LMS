import { Type } from '@sinclair/typebox';

export const CreateModuleSchema = {
  body: Type.Object({
    courseId: Type.Number(),
    title: Type.String(),
    description: Type.String(),
  }),
};

export const GetModulesSchema = {
  params: Type.Object({
    courseId: Type.Number(),
  }),
};

export const UpdateModuleSchema = {
  params: Type.Object({
    id: Type.Number(),
  }),
  body: Type.Object({
    title: Type.String(),
    description: Type.String(),
  }),
};

export const DeleteModuleSchema = {
  params: Type.Object({
    id: Type.Number(),
  }),
};