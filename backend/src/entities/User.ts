import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Role } from '../types/role';
import { Course } from './Course';
import { Enrollment } from './Enrollment';
import { QuizAttempt } from './QuizAttempt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.STUDENT
  })
  role!: Role;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  points!: number; // For gamification

  @Column({ nullable: true })
  badges!: string; // JSON or array for gamification

  @OneToMany(() => Course, course => course.instructor)
  courses!: Course[];

  @OneToMany(() => Enrollment, enrollment => enrollment.student)
  enrollments!: Enrollment[];

  @OneToMany(() => QuizAttempt, quizAttempt => quizAttempt.student)
  quizAttempts!: QuizAttempt[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}