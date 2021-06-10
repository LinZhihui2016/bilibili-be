import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpEntity, UpType } from './up.entity';
import { In, ObjectLiteral, Repository } from 'typeorm';
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

  async findByMid(mid: number) {
    return await this.upRepository.findOne({ where: { mid } });
  }

  async save(data: ObjectLiteral) {
    return await this.upRepository.save(data);
  }

  async findFail() {
    return await this.upRepository.find({
      where: { type: UpType.fail },
    });
  }

  async findNeedUpdate(take = 2) {
    return await this.upRepository.find({
      where: {
        type: In([UpType.normal]),
      },
      order: {
        updated: 'ASC',
      },
      take,
    });
  }
}
