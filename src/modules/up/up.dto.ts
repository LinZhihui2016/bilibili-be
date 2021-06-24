import { IsNumber } from 'class-validator';
import { UpType } from './up.entity';

export class UpBaseDto {
  @IsNumber()
  mid: number;

  name: string;
  sign: string;
  face: string;
  follower: number;
  archive: number;
  likes: number;
  type: UpType.normal;
}

export class UpFailDto {
  @IsNumber()
  mid: number;

  type: UpType.fail;
  fail_msg: string;
}

export class UpDeletedDto {
  @IsNumber()
  mid: number;

  type: UpType.deleted;
}
export type UpDto = UpBaseDto | UpFailDto | UpDeletedDto;
