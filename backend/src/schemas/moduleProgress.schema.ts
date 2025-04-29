import { Type } from '@sinclair/typebox';

export const UpdateModuleProgressSchema = {
  params: Type.Object({
    moduleId: Type.Number(),
  }),
  body: Type.Object({
    progressPercentage: Type.Optional(Type.Number()),
    isCompleted: Type.Optional(Type.Boolean()),
  }),
};

export const GetModuleProgressSchema = {
  params: Type.Object({
    moduleId: Type.Number(),
  }),
};