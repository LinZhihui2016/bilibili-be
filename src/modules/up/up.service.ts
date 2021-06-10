import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpEntity, UpType } from './up.entity';
import { In, ObjectLiteral, Repository } from 'typeorm';
import { listParams } from '../../util/mysql';
import { Alias } from '../../type';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { JobStatus, Queue } from 'bull';
import { pageParams } from '../../util/redis';
import { InjectQueue } from '@nestjs/bull';
import { UpJob } from './up.processor';
import $EntityFieldsNames = Alias.$EntityFieldsNames;

@Injectable()
export class UpService {
  constructor(
    @InjectRepository(UpEntity)
    private readonly upRepository: Repository<UpEntity>,
    @InjectQueue('up') private jobQueue: Queue<UpJob>,
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

  async getQueue(statusArr: JobStatus[], page, pageSize) {
    const list = await this.jobQueue.getJobs(statusArr);
    const $listFilterByType = list.map(
      ({ data, finishedOn, timestamp, id, failedReason }) => {
        let state: string;
        const setState = (v: string) => (state = v);
        if (finishedOn && failedReason) setState('fail');
        if (finishedOn && !failedReason) setState('completed');
        if (!finishedOn) setState('waiting');
        return {
          ...data,
          finishedOn,
          timestamp,
          id,
          failedReason,
          state,
        };
      },
    );
    return {
      list: pageParams($listFilterByType, { page, pageSize }),
      count: $listFilterByType.length,
    };
  }
}
