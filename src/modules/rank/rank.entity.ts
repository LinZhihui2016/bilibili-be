import { Column, Entity } from 'typeorm';
import { $BaseEntity } from '../../util/entity';
import { IsDate } from 'class-validator';

export enum RankId {
  全站 = 0,
  动画 = 1,
  音乐 = 3,
  舞蹈 = 129,
  游戏 = 4,
  知识 = 36,
  数码 = 188,
  生活 = 160,
  美食 = 211,
  动物 = 217,
  鬼畜 = 119,
  时尚 = 155,
  娱乐 = 5,
  影视 = 181,
}

@Entity({ name: 'rank' })
export class RankEntity extends $BaseEntity {
  @Column({
    type: 'enum',
    enum: RankId,
  })
  rid: RankId;

  @Column('datetime')
  @IsDate()
  date: Date;

  @Column('text')
  list: string;

  @Column('int')
  count_in_0: number;
}
