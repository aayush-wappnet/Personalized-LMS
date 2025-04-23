import { FastifyPluginAsync } from 'fastify';
import { CreateModuleSchema, GetModulesSchema, UpdateModuleSchema, DeleteModuleSchema } from '../schemas/module.schema';
import { createModule, getModules, updateModule, deleteModule } from '../controllers/module.controller';
import { authGuard } from '../middlewares/auth.guard'; // Import authGuard
import { Role } from '../types/role';

const moduleRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/modules', {
    schema: CreateModuleSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR }, // Only instructors/admins can create
    handler: createModule,
  });

  fastify.get('/modules/:courseId', {
    schema: GetModulesSchema,
    preHandler: authGuard,
    config: { requiredRole: undefined }, // All roles can view
    handler: getModules,
  });

  fastify.put('/modules/:id', {
    schema: UpdateModuleSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR }, // Only instructors/admins can update
    handler: updateModule,
  });

  fastify.delete('/modules/:id', {
    schema: DeleteModuleSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.INSTRUCTOR }, // Only instructors/admins can delete
    handler: deleteModule,
  });
};

export default moduleRoutes;