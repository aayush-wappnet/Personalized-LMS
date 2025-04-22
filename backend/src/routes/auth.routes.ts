import { FastifyPluginAsync } from 'fastify';
import { register, login, getProfile, getAllUsers, getUserById } from '../controllers/auth.controller';
import { authGuard } from '../middlewares/auth.guard';
import { RegisterSchema, LoginSchema, ProfileSchema } from '../schemas/auth.schema';
import { Role } from '../types/role';
import { FastifyRequest } from 'fastify/types/request';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/register', { schema: RegisterSchema }, register);
  fastify.post('/login', { schema: LoginSchema }, login);

  fastify.get('/profile', { schema: ProfileSchema, preHandler: authGuard }, getProfile);

  fastify.get('/users', {
    schema: ProfileSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.ADMIN },
  }, getAllUsers);

  fastify.get('/users/:id', {
    schema: ProfileSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.ADMIN },
  }, (request, reply) => getUserById(request as FastifyRequest<{ Params: { id: string } }>, reply));
};

export default authRoutes;