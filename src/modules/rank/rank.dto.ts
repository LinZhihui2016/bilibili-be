import { IsDate, IsNumber, IsString } from 'class-validator';
import { RankId } from './rank.entity';

export class RankDto {
  @IsNumber()
  rid: RankId;

  @IsDate()
  date: Date;

  @IsString({ each: true })
  list: string[];
}
