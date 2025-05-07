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
import quizRoutes from './routes/quiz.routes';
import quizAttemptRoutes from './routes/quizAttempt.routes';
import moduleProgressRoutes from './routes/moduleProgress.routes';
import { QuizService } from './services/quiz.service';
import { QuizAttemptService } from './services/quizAttempt.service';
import { ModuleProgressService } from './services/moduleProgress.service';
import { AnalyticsService } from './services/analytics.service';
import analyticsRoutes from './routes/analytics.routes';
import recommendationRoutes from './routes/recommendation.routes'; // Add this
import { RecommendationService } from './services/recommendation.service'; // Add this

export const app = Fastify({
  logger: process.env.NODE_ENV === 'development',
});

app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

app.register(fastifyMultipart, {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  attachFieldsToBody: 'keyValues',
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
  const quizService = new QuizService(instance);
  const quizAttemptService = new QuizAttemptService();
  const moduleProgressService = new ModuleProgressService();
  const analyticsService = new AnalyticsService();
  const recommendationService = new RecommendationService(); // Add this

  instance.decorate('courseService', courseService);
  instance.decorate('moduleService', moduleService);
  instance.decorate('contentService', contentService);
  instance.decorate('notificationService', notificationService);
  instance.decorate('quizService', quizService);
  instance.decorate('quizAttemptService', quizAttemptService);
  instance.decorate('moduleProgressService', moduleProgressService);
  instance.decorate('analyticsService', analyticsService);
  instance.decorate('recommendationService', recommendationService); // Add this

  instance.register(authRoutes, { prefix: '/api/auth' });
  instance.register(courseRoutes, { prefix: '/api' });
  instance.register(moduleRoutes, { prefix: '/api' });
  instance.register(contentRoutes, { prefix: '/api' });
  instance.register(notificationRoutes, { prefix: '/api' });
  instance.register(quizRoutes, { prefix: '/api' });
  instance.register(quizAttemptRoutes, { prefix: '/api' });
  instance.register(moduleProgressRoutes, { prefix: '/api' });
  instance.register(analyticsRoutes, { prefix: '/api' });
  instance.register(recommendationRoutes, { prefix: '/api' }); // Add this
  done();
});

app.get('/health', async (request, reply) => {
  return { status: 'OK', database: app.db.isInitialized };
});