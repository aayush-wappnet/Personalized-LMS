import { FastifyRequest, FastifyReply } from 'fastify';
import { ModuleProgressService } from '../services/moduleProgress.service';
import { Role } from '../types/role';

export const getModuleProgress = async (request: FastifyRequest<{ Params: { moduleId: number } }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.STUDENT) {
      throw new Error('Only students can view module progress');
    }
    const moduleProgressService = new ModuleProgressService();
    const progress = await moduleProgressService.getModuleProgress(user.id, request.params.moduleId);
    reply.send(progress || { progressPercentage: 0, isCompleted: false });
  } catch (err: any) {
    reply.code(404).send({ error: err.message });
  }
};

export const updateModuleProgress = async (request: FastifyRequest<{ Params: { moduleId: number }; Body: { progressPercentage?: number; isCompleted?: boolean } }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.STUDENT) {
      throw new Error('Only students can update module progress');
    }
    const moduleProgressService = new ModuleProgressService();
    const progress = await moduleProgressService.updateModuleProgress(user.id, request.params.moduleId, request.body);
    reply.send(progress);
  } catch (err: any) {
    reply.code(400).send({ error: err.message });
  }
};