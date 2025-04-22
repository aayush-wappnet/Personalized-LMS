import Fastify from 'fastify';
import databasePlugin from './plugins/database-plugin';
import fastifyCors from '@fastify/cors';
import authPlugin from './plugins/auth-plugin';
import authRoutes from './routes/auth.routes';

export const app = Fastify({
  logger: process.env.NODE_ENV === 'development',
});

app.register(fastifyCors, {
  origin: true, // Allows all origins; adjust as needed (e.g., 'http://localhost:3000')
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

app.register(databasePlugin);
app.register(authPlugin);

app.register(authRoutes, { prefix: '/api/auth' });

app.get('/health', async (request, reply) => {
  return { status: 'OK', database: app.db.isInitialized };
});