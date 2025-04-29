import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Course } from './Course';
import { Content } from './Content';
import { ModuleProgress } from './ModuleProgress';
import { Quiz } from './Quiz'; // Import the Quiz entity

@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description!: string;

  @ManyToOne(() => Course, course => course.modules)
  course!: Course;

  @OneToMany(() => Content, content => content.module)
  contents!: Content[];

  @OneToMany(() => Quiz, quiz => quiz.module)
  quizzes!: Quiz[];

  @OneToMany(() => ModuleProgress, progress => progress.module)
  progress!: ModuleProgress[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}