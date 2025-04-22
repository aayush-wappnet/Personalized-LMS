import { DataSource } from 'typeorm';
import { UserPayload } from './auth';
import { Role } from './role';

declare module 'fastify' {
  interface FastifyInstance {
    db: DataSource;
    verifyJWT: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user?: UserPayload;
  }

  interface FastifyContextConfig {
    requiredRole?: Role;
  }
}