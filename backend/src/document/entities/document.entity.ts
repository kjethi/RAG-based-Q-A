import { DocumentStatus } from 'src/common/enums/document-status.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('document')
export class DocumentEnity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  filename: string;

  @Column()
  s3Path: string;

  @Column()
  type: string;
  
  @Column()
  size: number;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
