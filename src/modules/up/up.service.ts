import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { RedisService } from 'nestjs-redis';
import { UpEntity, UpType } from './up.entity';
import { cacheName, CacheType } from '../../util/redis';
import { UpBaseDto, UpDto } from './up.dto';
import { errorLog } from '../../log4js/log';
import { apiUserInfo, apiUserStat, apiUserUpstat } from '../../crawler/user';
import { HOUR, sleep } from '../../util/date';
import { $val } from '../../util/mysql';
import { JobType } from '../../jobs/job.type';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class UpService {
  private readonly logger = new Logger(UpService.name);

  constructor(
    @InjectRepository(UpEntity)
    private readonly upRepository: Repository<UpEntity>,
    @InjectQueue('job') private jobQueue: Queue,
    private readonly redisService: RedisService,
  ) {}

  async create(data: UpDto) {
    const { mid } = data;
    const $data = await this.upRepository.findOne({ where: { mid } });
    const $$data = await $val($data || new UpEntity(), data);
    const redis = this.redisService.getClient();
    const redisKey = cacheName(CacheType.up, mid);
    await redis.set(redisKey, JSON.stringify($$data));
    await redis.expire(redisKey, HOUR);
    this.logger.log(redisKey);
    return await this.upRepository.save($$data);
  }

  failFetch(mid: number, fail_msg: string) {
    errorLog([mid, fail_msg].join(' | '));
    return this.create({
      type: UpType.fail,
      mid,
      fail_msg,
    });
  }

  async fetch(mid: number) {
    const redisKey = cacheName(CacheType.up, mid);
    const data = await this.redisService.getClient().get(redisKey);
    if (data) return this.create(JSON.parse(data) as UpDto);

    const [e1, info] = await apiUserInfo(mid);
    if (e1) return this.failFetch(mid, e1.toString());
    await sleep(300);
    const [e2, stat] = await apiUserStat(mid);
    if (e2) return this.failFetch(mid, e2.toString());
    await sleep(300);
    const [e3, upstat] = await apiUserUpstat(mid);
    if (e3) return this.failFetch(mid, e3.toString());
    try {
      const {
        data: { sign, face, name },
      } = info;
      const {
        data: { follower },
      } = stat;
      const {
        data: {
          archive: { view },
          likes,
        },
      } = upstat;
      const normalUp: UpBaseDto = {
        sign,
        face,
        name,
        follower,
        archive: view,
        likes,
        mid,
        type: UpType.normal,
      };
      return this.create(normalUp);
    } catch (e) {
      return this.failFetch(mid, e.message);
    }
  }

  async start(list: number[]) {
    await this.jobQueue.addBulk(
      list.map((key) => ({
        name: 'crawler',
        data: { type: JobType.Up, key },
      })),
    );
  }

  @Cron('0 0 18 * * *')
  async retry() {
    const list = await this.upRepository.find({
      where: { type: UpType.fail + '' },
    });
    const upList = list.map((i) => i.mid);
    await this.start(upList);
    return upList.length;
  }

  @Cron('0 * * * * *')
  async update() {
    const list = await this.upRepository.find({
      where: {
        type: UpType.normal + '',
      },
      order: {
        updated: 'ASC',
      },
      take: 2,
    });
    await this.start(list.map((i) => i.mid));
  }
}
