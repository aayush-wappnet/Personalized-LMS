import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { UserPayload } from '../types/auth';
import { FastifyRequest, FastifyReply } from 'fastify';

dotenv.config();

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('verifyJWT', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) throw new Error('No token provided');
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
      request.user = decoded;
    } catch (err) {
      reply.code(401).send({ error: 'Invalid or expired token' });
    }
  });
};

export default fp(authPlugin, {
  name: 'auth-plugin',
});