import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Chart } from '../../chart/entities/chart.entity';
import { Chat } from '../../chat/entities/chat.entity';

@Entity('dashboards')
export class Dashboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  connectedSource: {
    id: string;
    name: string;
    type: 'file' | 'sheet';
    url?: string;
    fileId?: string;
    createdAt?: string;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  connectedSources: {
    id: string;
    name: string;
    type: 'file' | 'sheet';
    url?: string;
    fileId?: string;
    createdAt?: string;
  }[] | null;

  @ManyToOne(() => User, (user) => user.dashboards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Chart, (chart) => chart.dashboard, {
    cascade: true,
    eager: true,
  })
  charts: Chart[];

  @OneToOne(() => Chat, (chat) => chat.dashboard, {
    cascade: true,
    eager: true,
  })
  chat: Chat;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
