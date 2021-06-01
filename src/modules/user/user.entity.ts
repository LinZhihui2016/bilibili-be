import { Column, Entity } from 'typeorm';
import { $BaseEntity } from '../../util/entity';

@Entity({ name: 'user' })
export class UserEntity extends $BaseEntity {
  @Column({ type: 'char', length: '16' })
  username: string;

  @Column({ type: 'char', length: '32' })
  password: string;
}
