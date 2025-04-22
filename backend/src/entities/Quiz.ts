import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Question } from './Question';
import { QuizAttempt } from './QuizAttempt';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description!: string;

  @Column()
  moduleId!: number;

  @OneToMany(() => Question, question => question.quiz)
  questions!: Question[];

  @OneToMany(() => QuizAttempt, attempt => attempt.quiz)
  attempts!: QuizAttempt[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}