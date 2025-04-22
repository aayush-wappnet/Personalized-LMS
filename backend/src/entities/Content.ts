import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Module } from './Module';

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ nullable: true })
  fileUrl!: string; // Stored in Cloudinary

  @ManyToOne(() => Module, module => module.contents)
  module!: Module;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}