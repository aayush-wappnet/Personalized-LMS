import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Course } from './Course';
import { Content } from './Content';
import { ModuleProgress } from './ModuleProgress';

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

  @OneToMany(() => ModuleProgress, progress => progress.module)
  progress!: ModuleProgress[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}