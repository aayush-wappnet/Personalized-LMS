import { FastifyPluginAsync } from 'fastify';
import { AppDataSource } from '../config/database';
import { DataSource } from 'typeorm';

declare module 'fastify' {
  interface FastifyInstance {
    db: DataSource;
  }
}

const databasePlugin: FastifyPluginAsync = async (fastify) => {
  try {
    await AppDataSource.initialize();
    fastify.decorate('db', AppDataSource);
    fastify.log.info('Database connected successfully');
  } catch (err) {
    fastify.log.error('Database connection failed:', err);
    throw err;
  }
};

export default databasePlugin;