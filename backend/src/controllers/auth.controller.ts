import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { Role } from '../types/role';

const authService = new AuthService();

export const register = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { userName, email, password, role } = request.body as { userName: string; email: string; password: string; role?: Role };
    const response = await authService.register({ userName, email, password, role });
    reply.code(201).send(response);
  } catch (err: any) {
    reply.code(400).send({ error: err.message });
  }
};

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { email, password } = request.body as { email: string; password: string };
    const { token } = await authService.login(email, password); // Destructure only token
    reply.send({ token }); // Send only the token in the response
  } catch (err: any) {
    reply.code(401).send({ error: err.message });
  }
};

export const getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number };
    const profile = await authService.getProfile(user.id);
    reply.send(profile);
  } catch (err: any) {
    reply.code(404).send({ error: err.message });
  }
};

export const getAllUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const users = await authService.getAllUsers();
    reply.send(users);
  } catch (err: any) {
    reply.code(500).send({ error: err.message });
  }
};

export const getUserById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const userId = Number(request.params.id);
    const user = await authService.getUserById(userId);
    reply.send(user);
  } catch (err: any) {
    reply.code(404).send({ error: err.message });
  }
};