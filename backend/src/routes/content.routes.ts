import { FastifyPluginAsync } from 'fastify';
import { CreateContentSchema, GetContentsSchema, UpdateContentSchema, DeleteContentSchema } from '../schemas/content.schema';
import { createContent, getContents, updateContent, deleteContent } from '../controllers/content.controller';
import { authGuard } from '../middlewares/auth.guard'; // Import authGuard
import { Role } from '../types/role';

const contentRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/contents', {
    schema: CreateContentSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR }, // Only instructors/admins can create
    handler: createContent,
  });

  fastify.get('/contents/:moduleId', {
    schema: GetContentsSchema,
    preHandler: authGuard,
    config: { requiredRole: undefined }, // All roles can view
    handler: getContents,
  });

  fastify.put('/contents/:id', {
    schema: UpdateContentSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR }, // Only instructors/admins can update
    handler: updateContent,
  });

  fastify.delete('/contents/:id', {
    schema: DeleteContentSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR }, // Only instructors/admins can delete
    handler: deleteContent,
  });
};

export default contentRoutes;