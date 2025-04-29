import { FastifyPluginAsync } from 'fastify';
import { UpdateModuleProgressSchema, GetModuleProgressSchema } from '../schemas/moduleProgress.schema';
import { getModuleProgress, updateModuleProgress } from '../controllers/moduleProgress.controller';
import { authGuard } from '../middlewares/auth.guard';
import { Role } from '../types/role';

const moduleProgressRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/module-progress/:moduleId', {
    schema: GetModuleProgressSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.STUDENT },
    handler: getModuleProgress,
  });

  fastify.put('/module-progress/:moduleId', {
    schema: UpdateModuleProgressSchema,
    preHandler: authGuard,
    config: { requiredRole: Role.STUDENT },
    handler: updateModuleProgress,
  });
};

export default moduleProgressRoutes;