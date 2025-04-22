import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Module } from './Module';

@Entity('module_progress')
export class ModuleProgress {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: 0 })
  progressPercentage!: number;

  @Column({ default: false })
  isCompleted!: boolean;

  @ManyToOne(() => User, user => user.enrollments)
  student!: User;

  @ManyToOne(() => Module, module => module.progress)
  module!: Module;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}