import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Quiz } from './Quiz';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  questionText!: string;

  @Column('jsonb')
  options!: { id: number; text: string; isCorrect: boolean }[];

  @ManyToOne(() => Quiz, quiz => quiz.questions)
  quiz!: Quiz;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}