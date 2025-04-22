import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../entities/User';
import { Course } from '../entities/Course';
import { Module } from '../entities/Module';
import { Content } from '../entities/Content';
import { Quiz } from '../entities/Quiz';
import { Question } from '../entities/Question';
import { QuizAttempt } from '../entities/QuizAttempt';
import { Enrollment } from '../entities/Enrollment';
import { ModuleProgress } from '../entities/ModuleProgress';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.NODE_ENV === 'development', // Set to false in production
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Course, Module, Content, Quiz, Question, QuizAttempt, Enrollment, ModuleProgress],
  migrations: [],
  subscribers: [],
});