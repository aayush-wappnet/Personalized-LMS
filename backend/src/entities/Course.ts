import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Module } from './Module';
import { Enrollment } from './Enrollment';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description!: string;

  @Column()
  thumbnailUrl!: string; // Stored in Cloudinary

  @ManyToOne(() => User, user => user.courses)
  instructor!: User;

  @OneToMany(() => Module, module => module.course)
  modules!: Module[];

  @OneToMany(() => Enrollment, enrollment => enrollment.course)
  enrollments!: Enrollment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}