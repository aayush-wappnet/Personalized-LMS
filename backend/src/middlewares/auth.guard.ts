import { FastifyRequest, FastifyReply } from 'fastify';
import { Role } from '../types/role'; // Adjust the import path as necessary


export const authGuard = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.server.verifyJWT(request, reply);
    const user = request.user as { role: Role; id: number };
    if (!user) throw new Error('Unauthorized');
    if (request.routeOptions.config?.requiredRole && user.role !== request.routeOptions.config.requiredRole) {
      throw new Error('Forbidden');
    }
  } catch (err:any) {
    reply.code(403).send({ error: err.message });
  }
};