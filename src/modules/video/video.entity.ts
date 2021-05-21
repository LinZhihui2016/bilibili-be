import { $BaseEntity } from '../../util/entity';
import { Column, Entity, Index } from 'typeorm';

export enum VideoType {
  normal,
  bangumi,
  deleted,
  fail,
}

@Entity({ name: 'video' })
export class VideoEntity extends $BaseEntity {
  @Column({ type: 'char', length: '20' })
  @Index()
  bvid: string;

  @Column({ type: 'bigint', nullable: true })
  aid: number;

  @Column({ type: 'text', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  desc: string;

  @Column({ type: 'text', nullable: true })
  pic: string;

  @Column({ type: 'bigint', nullable: true })
  views: number;

  @Column({ type: 'int', nullable: true })
  danmaku: number;

  @Column({ type: 'int', nullable: true })
  reply: number;

  @Column({ type: 'int', nullable: true })
  coin: number;

  @Column({ type: 'int', nullable: true })
  likes: number;

  @Column({ type: 'bigint', nullable: true })
  up_mid: number;

  @Column({ type: 'char', nullable: true, length: '20' })
  up_name: string;

  @Column({
    type: 'enum',
    enum: VideoType,
  })
  type: VideoType;

  @Column({ type: 'int', nullable: true })
  favorite: number;

  @Column({ type: 'int', nullable: true })
  share: number;

  @Column({ type: 'datetime', nullable: true })
  pubdate: Date;

  @Column({ type: 'int', nullable: true })
  epId: number;

  @Column({ type: 'text', nullable: true })
  fail_msg: string;
}
