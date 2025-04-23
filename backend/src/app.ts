import Fastify from 'fastify';
import databasePlugin from './plugins/database-plugin';
import fastifyCors from '@fastify/cors';
import authPlugin from './plugins/auth-plugin';
import authRoutes from './routes/auth.routes';
import fastifyMultipart from '@fastify/multipart';
import { CourseService } from './services/course.service';
import cloudinaryPlugin from './plugins/cloudinary-plugin';
import courseRoutes from './routes/course.routes';
import websocketPlugin from './plugins/websocket-plugin';
import emailPlugin from './plugins/email-plugin';
import notificationRoutes from './routes/notification.routes';
import { NotificationService } from './services/notification.service';
import { ModuleService } from './services/module.service';
import contentRoutes from './routes/content.routes';
import { ContentService } from './services/content.service';
import moduleRoutes from './routes/module.routes';


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
app.register(cloudinaryPlugin);
app.register(websocketPlugin);
app.register(emailPlugin);
app.register(authPlugin);

app.register((instance, opts, done) => {
  const courseService = new CourseService(instance);
  const moduleService = new ModuleService(instance);
  const contentService = new ContentService(instance);
  const notificationService = new NotificationService(instance);

  instance.decorate('courseService', courseService);
  instance.decorate('moduleService', moduleService);
  instance.decorate('contentService', contentService);
  instance.decorate('notificationService', notificationService);

  instance.register(authRoutes, { prefix: '/api/auth' });
  instance.register(courseRoutes, { prefix: '/api' });
  instance.register(moduleRoutes, { prefix: '/api' });
  instance.register(contentRoutes, { prefix: '/api' });
  instance.register(notificationRoutes, { prefix: '/api' });
  done();
});

app.get('/health', async (request, reply) => {
  return { status: 'OK', database: app.db.isInitialized };
});