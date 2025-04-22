import { Role } from './role';

export interface UserPayload {
  id: number;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}