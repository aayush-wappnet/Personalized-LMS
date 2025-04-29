import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany ,ManyToOne} from 'typeorm';
import { Question } from './Question';
import { QuizAttempt } from './QuizAttempt';
import { Module } from './Module'; // Import the Module entity

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description!: string;

  @ManyToOne(() => Module, module => module.quizzes) // Replace moduleId with a relation
  module!: Module;

  @OneToMany(() => Question, question => question.quiz)
  questions!: Question[];

  @OneToMany(() => QuizAttempt, attempt => attempt.quiz)
  attempts!: QuizAttempt[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}