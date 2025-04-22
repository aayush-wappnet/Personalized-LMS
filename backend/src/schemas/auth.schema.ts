import { Static, Type } from '@sinclair/typebox';
import { Role } from '../types/role';

export const RegisterSchema = Type.Object({
  body: Type.Object({
    userName: Type.String(),
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 6 }),
    role: Type.Optional(Type.Enum(Role)),
  }),
});

export const LoginSchema = Type.Object({
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 6 }),
  }),
});

export const ProfileSchema = Type.Object({
  headers: Type.Object({
    authorization: Type.String(),
  }),
});