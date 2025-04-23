import Fastify from 'fastify';
import databasePlugin from './plugins/database-plugin';
import fastifyCors from '@fastify/cors';
import authPlugin from './plugins/auth-plugin';
import authRoutes from './routes/auth.routes';
import fastifyMultipart from '@fastify/multipart';
import { CourseService } from './services/course.service';
import cloudinaryPlugin from './plugins/cloudinary-plugin';
import courseRoutes from './routes/course.routes';

export const app = Fastify({
  logger: process.env.NODE_ENV === 'development',
});

app.register(fastifyCors, {
  origin: true, // Allows all origins; adjust as needed (e.g., 'http://localhost:3000')
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

app.register(fastifyMultipart, {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  attachFieldsToBody: 'keyValues', // Parse fields as key-value pairs instead of objects with circular references
});

app.register(databasePlugin);
app.register(authPlugin);
app.register(cloudinaryPlugin);

const courseService = new CourseService(app); // Instantiate with fastify instance

app.register(authRoutes, { prefix: '/api/auth' });
app.register((instance, opts, done) => {
  instance.decorate('courseService', courseService); // Decorate fastify with courseService
  instance.register(courseRoutes, { prefix: '/api' });
  done();
});

app.get('/health', async (request, reply) => {
  return { status: 'OK', database: app.db.isInitialized };
});