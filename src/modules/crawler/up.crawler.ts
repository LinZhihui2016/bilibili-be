import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { RedisService } from 'nestjs-redis';
import { UpEntity, UpType } from '../up/up.entity';
import { cacheName, CacheType } from '../../util/redis';
import { UpBaseDto, UpDto } from '../up/up.dto';
import { errorLog } from '../../log4js/log';
import { apiUserInfo, apiUserStat, apiUserUpstat } from '../../crawler/user';
import { HOUR, sleep } from '../../util/date';
import { $val } from '../../util/mysql';
import { CrawlerType, JobData, JobUpFrom } from './crawler.type';
import { Cron } from '@nestjs/schedule';
import { UpService } from '../up/up.service';

@Injectable()
export class UpCrawler {
  private readonly logger = new Logger(UpCrawler.name);

  constructor(
    @InjectQueue('job') private jobQueue: Queue<JobData>,
    private readonly redisService: RedisService,
    private readonly upService: UpService,
  ) {}

  async create(data: UpDto) {
    const { mid } = data;
    const $data = await this.upService.findByMid(mid);
    const $$data = await $val($data || new UpEntity(), data);
    if (data.type !== UpType.fail) {
      $$data.fail_msg = '';
    }
    $$data.crawlerTimes = ($$data.crawlerTimes || 0) + 1;
    const redis = this.redisService.getClient();
    const redisKey = cacheName(CacheType.up, mid);
    await redis.set(redisKey, JSON.stringify($$data));
    await redis.expire(redisKey, HOUR);
    const saveData = await this.upService.save($$data);
    this.logger.log(redisKey);
    return saveData;
  }

  async failFetch(mid: number, fail_msg: string) {
    errorLog([mid, fail_msg].join(' | '));
    const $data = await this.upService.findByMid(mid);

    if ($data) return;
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

  async start(list: number[], from: JobUpFrom) {
    await this.jobQueue.addBulk(
      list.map((key) => ({
        name: 'crawler',
        data: { type: CrawlerType.UP, key, from },
      })),
    );
  }

  @Cron('0 0 * * * *')
  async retry() {
    const list = await this.upService.findFail();
    const upList = list.map((i) => i.mid);
    await this.start(upList, JobUpFrom.RETRY);
    return upList.length;
  }

  @Cron('0 * * * * *')
  async update() {
    const waitCount = await this.jobQueue.getWaitingCount();
    if (waitCount > 100) return;
    const list = await this.upService.findNeedUpdate(2);
    await this.start(
      list.map((i) => i.mid),
      JobUpFrom.UPDATE,
    );
  }
}
