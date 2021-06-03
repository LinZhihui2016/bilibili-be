import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpEntity, UpType } from './up.entity';
import { Repository } from 'typeorm';
import { listParams } from '../../util/mysql';
import { Alias } from '../../type';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import $EntityFieldsNames = Alias.$EntityFieldsNames;

@Injectable()
export class UpService {
  constructor(
    @InjectRepository(UpEntity)
    private readonly upRepository: Repository<UpEntity>,
  ) {}

  async getList(
    opt: {
      page?: string;
      pageSize?: string;
      orderby?: Alias.OrderBy;
      orderKey?: $EntityFieldsNames<UpEntity>;
    },
    type: keyof typeof UpType,
  ) {
    const where: FindOneOptions<UpEntity>['where'] = {};
    if (Object.keys(UpType).includes(UpType[type])) {
      where.type = UpType[type];
    }
    const [list, count] = await this.upRepository.findAndCount({
      ...listParams({ ...opt, orderList: ['likes', 'archive', 'follower'] }),
      where,
    });
    return { list, count };
  }
}
