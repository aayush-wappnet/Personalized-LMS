import { FastifyRequest, FastifyReply } from 'fastify';
import { Role } from '../types/role';
import { Static } from '@sinclair/typebox';
import { CreateModuleSchema, GetModulesSchema, UpdateModuleSchema, DeleteModuleSchema } from '../schemas/module.schema';

type CreateModuleBody = Static<typeof CreateModuleSchema.body>;
type GetModulesParams = Static<typeof GetModulesSchema.params>;
type UpdateModuleParams = Static<typeof UpdateModuleSchema.params>;
type UpdateModuleBody = Static<typeof UpdateModuleSchema.body>;
type DeleteModuleParams = Static<typeof DeleteModuleSchema.params>;

export const createModule = async (request: FastifyRequest<{ Body: CreateModuleBody }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.INSTRUCTOR && user.role !== Role.ADMIN) {
      throw new Error('Only instructors or admins can create modules');
    }
    const module = await request.server.moduleService.createModule(user.id, request.body);
    reply.code(201).send({ id: module.id, message: 'Module created successfully' });
  } catch (err: any) {
    reply.code(400).send({ error: err.message });
  }
};

export const getModules = async (request: FastifyRequest<{ Params: GetModulesParams }>, reply: FastifyReply) => {
  try {
    const { courseId } = request.params;
    const modules = await request.server.moduleService.getModules(courseId);
    reply.send(modules);
  } catch (err: any) {
    reply.code(400).send({ error: err.message });
  }
};

export const updateModule = async (request: FastifyRequest<{ Params: UpdateModuleParams; Body: UpdateModuleBody }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.INSTRUCTOR && user.role !== Role.ADMIN) {
      throw new Error('Only instructors or admins can update modules');
    }
    const module = await request.server.moduleService.updateModule(user.id, request.params.id, request.body);
    reply.send({ id: module.id, message: 'Module updated successfully' });
  } catch (err: any) {
    reply.code(400).send({ error: err.message });
  }
};

export const deleteModule = async (request: FastifyRequest<{ Params: DeleteModuleParams }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.INSTRUCTOR && user.role !== Role.ADMIN) {
      throw new Error('Only instructors or admins can delete modules');
    }
    await request.server.moduleService.deleteModule(user.id, request.params.id);
    reply.send({ message: 'Module deleted successfully' });
  } catch (err: any) {
    reply.code(400).send({ error: err.message });
  }
};