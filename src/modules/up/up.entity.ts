import { Column, Entity, Index } from 'typeorm';
import { $BaseEntity } from '../../util/entity';

export enum UpType {
  normal,
  fail,
}

@Entity({ name: 'up' })
export class UpEntity extends $BaseEntity {
  @Column({ type: 'bigint' })
  @Index()
  mid: number;

  @Column({ type: 'bigint', nullable: true })
  archive: number;
  @Column({ type: 'bigint', nullable: true })
  follower: number;
  @Column({ type: 'bigint', nullable: true })
  likes: number;

  @Column({ type: 'text', nullable: true })
  name: string;
  @Column({ type: 'text', nullable: true })
  sign: string;
  @Column({ type: 'text', nullable: true })
  face: string;

  @Column({ type: 'enum', enum: UpType })
  type: UpType;
  @Column({ type: 'text', nullable: true })
  fail_msg: string;
  @Column({ type: 'int', nullable: true })
  crawlerTimes: number;
}
