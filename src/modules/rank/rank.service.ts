import { Injectable } from '@nestjs/common';
import { Connection, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RankEntity, RankId } from './rank.entity';
import { apiRank } from '../../crawler/ranking';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  JobData,
  JobRankFrom,
  JobType,
  JobVideoFrom,
} from '../../jobs/job.type';
import { Cron } from '@nestjs/schedule';
import { RankDto } from './rank.dto';
import { $val } from '../../util/mysql';
import dayjs from 'dayjs';

@Injectable()
export class RankService {
  constructor(
    @InjectRepository(RankEntity)
    private readonly rankRepository: Repository<RankEntity>,
    @InjectQueue('job') private jobQueue: Queue<JobData>,
    private connection: Connection,
  ) {}

  async create(data: RankDto) {
    const { rid, list, date } = data;
    const $list = list.join(',');
    const rank = await $val(new RankEntity(), {
      rid,
      list: $list,
      count_in_0: 0,
      date,
    });
    return await this.rankRepository.save(rank);
  }

  async count(day?: string) {
    const today = dayjs(day).startOf('day');
    const list = await this.rankRepository.find({
      where: {
        date: today.toDate(),
      },
    });
    const map = new Map<RankId, string[]>();
    const countMap = new Map<RankId, number>();
    list.forEach(({ list, rid }) => {
      map.set(rid, list.split(','));
    });
    let total = 100;
    const master = map.get(RankId.全站);

    map.forEach((list, rid) => {
      if (rid === RankId.全站) {
        return;
      }
      const count = list.filter((bv) => master.includes(bv)).length;
      countMap.set(rid, count);
      total -= count;
    });
    countMap.set(RankId.全站, total);
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const i of countMap) {
        const [rid, count_in_0] = i;
        const data = await this.rankRepository.findOne({
          where: { rid: rid + '', date: today.toDate() },
        });
        const $data = await $val(data, { count_in_0 });
        await queryRunner.manager.getRepository(RankEntity).save($data);
      }
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async fetch(rid: RankId) {
    const [err, data] = await apiRank(rid);
    if (err) {
      return this.create({
        rid,
        list: [],
        date: dayjs().startOf('day').toDate(),
      });
    }
    const list = data.data.list.map((i) => i.bvid);
    await this.jobQueue.addBulk(
      list.map((key) => ({
        name: 'crawler',
        data: { type: JobType.Video, key, from: JobVideoFrom.RANK },
      })),
    );
    return this.create({
      rid,
      list,
      date: dayjs().startOf('day').toDate(),
    });
  }

  @Cron('0 0 5 * * *')
  async addRankJob() {
    const rankIdList = Object.keys(RankId).filter((i) =>
      /^[0-9]*$/.test(i),
    ) as unknown as RankId[];
    rankIdList.push(-1);
    await this.jobQueue.addBulk(
      rankIdList.map((key) => ({
        name: 'crawler',
        data: { type: JobType.Rank, key, from: JobRankFrom.CRON },
      })),
    );
  }
}
