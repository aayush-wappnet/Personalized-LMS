import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  message!: string;

  @Column({ default: false })
  isRead!: boolean;

  @Column({ nullable: true })
  relatedEntity!: string; // e.g., 'Course', 'Module', 'Quiz'

  @Column({ nullable: true })
  relatedEntityId!: number; // ID of the related entity (e.g., courseId)

  @ManyToOne(() => User, user => user.notifications)
  recipient!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}