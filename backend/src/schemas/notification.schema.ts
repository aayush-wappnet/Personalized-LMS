import { Type } from '@sinclair/typebox';

export const CreateNotificationSchema = {
  body: Type.Object({
    recipientId: Type.Number(),
    message: Type.String(),
  }),
};

export const GetNotificationsSchema = {
  params: Type.Object({
    userId: Type.Number(),
  }),
};

export const MarkNotificationReadSchema = {
  params: Type.Object({
    id: Type.Number(),
  }),
};