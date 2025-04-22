import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Quiz } from './Quiz';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('jsonb')
  answers!: { questionId: number; selectedOptionId: number }[];

  @Column({ type: 'float' })
  score!: number;

  @ManyToOne(() => User, user => user.quizAttempts)
  student!: User;

  @ManyToOne(() => Quiz, quiz => quiz.attempts)
  quiz!: Quiz;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}