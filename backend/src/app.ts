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
import quizRoutes from './routes/quiz.routes'; // Add this
import quizAttemptRoutes from './routes/quizAttempt.routes'; // Add this
import moduleProgressRoutes from './routes/moduleProgress.routes'; // Add this
import { QuizService } from './services/quiz.service'; // Add this
import { QuizAttemptService } from './services/quizAttempt.service'; // Add this
import { ModuleProgressService } from './services/moduleProgress.service'; // Add this

import { AnalyticsService } from './services/analytics.service'; // Add this
import analyticsRoutes from './routes/analytics.routes';

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
  const quizService = new QuizService(instance); // Add this
  const quizAttemptService = new QuizAttemptService(); // Add this
  const moduleProgressService = new ModuleProgressService(); // Add this
  const analyticsService = new AnalyticsService(); // Add this

  instance.decorate('courseService', courseService);
  instance.decorate('moduleService', moduleService);
  instance.decorate('contentService', contentService);
  instance.decorate('notificationService', notificationService);
  instance.decorate('quizService', quizService); // Add this
  instance.decorate('quizAttemptService', quizAttemptService); // Add this
  instance.decorate('moduleProgressService', moduleProgressService); // Add this
  instance.decorate('analyticsService', analyticsService); // Add this

  instance.register(authRoutes, { prefix: '/api/auth' });
  instance.register(courseRoutes, { prefix: '/api' });
  instance.register(moduleRoutes, { prefix: '/api' });
  instance.register(contentRoutes, { prefix: '/api' });
  instance.register(notificationRoutes, { prefix: '/api' });
  instance.register(quizRoutes, { prefix: '/api' }); // Add this
  instance.register(quizAttemptRoutes, { prefix: '/api' }); // Add this
  instance.register(moduleProgressRoutes, { prefix: '/api' }); // Add this
  instance.register(analyticsRoutes, { prefix: '/api' }); // Add this
  done();
});

app.get('/health', async (request, reply) => {
  return { status: 'OK', database: app.db.isInitialized };
});