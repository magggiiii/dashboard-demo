import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Dashboard } from '../../dashboard/entities/dashboard.entity';
import { File } from '../../file/entities/file.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  githubId: string;

  @Column({ nullable: true })
  provider: string;

  @Column({ nullable: true })
  password: string;

  @OneToMany(() => Dashboard, (dashboard) => dashboard.user, {
    cascade: true,
    eager: true,
  })
  dashboards: Dashboard[];

  @OneToMany(() => File, (file) => file.user, {
    cascade: true,
    eager: true,
  })
  files: File[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
