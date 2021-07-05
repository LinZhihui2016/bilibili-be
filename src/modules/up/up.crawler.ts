import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { RedisService } from 'nestjs-redis';
import { UpEntity, UpType } from './up.entity';
import { cacheName, CacheType } from '../../util/redis';
import { UpBaseDto, UpDto } from './up.dto';
import { errorLog } from '../../log4js/log';
import { apiUserInfo, apiUserStat, apiUserUpstat } from '../../crawler/user';
import { expireTime, MINUTE, sleep, WEEK } from '../../util/date';
import { $val } from '../../util/mysql';
import { Cron } from '@nestjs/schedule';
import { UpFrom, UpJob } from './up.processor';
import { UpService } from './up.service';
import { MagicNumber } from '../../util/magicNumber';
import dayjs from 'dayjs';

@Injectable()
export class UpCrawler {
  private readonly logger = new Logger(UpCrawler.name);
  private log(k: string, f: string) {
    this.logger.log([k, 'from', f].join(' '));
  }
  constructor(
    @InjectQueue('up') private jobQueue: Queue<UpJob>,
    private readonly redisService: RedisService,
    private readonly upService: UpService,
  ) {}

  async create(data: UpDto, from = 'crawler') {
    const { mid } = data;
    await this.logStep('create', 'start', mid);
    const $data = await this.upService.findByMid(mid);
    const $$data = await $val($data || new UpEntity(), data);
    if (data.type !== UpType.fail) {
      $$data.fail_msg = '';
    }
    $$data.crawlerTimes = ($$data.crawlerTimes || 0) + 1;
    const redis = this.redisService.getClient('upCache');
    const redisKey = cacheName(CacheType.up, mid);
    await redis.set(redisKey, JSON.stringify($$data));
    await redis.expire(redisKey, expireTime(MINUTE * 10));
    const saveData = await this.upService.save($$data);
    this.log(redisKey, from);
    if (from === 'crawler') {
      await sleep(10000);
    }
    await this.logStep('create', 'end', mid);
    return saveData;
  }

  async failFetch(mid: number, fail_msg: string) {
    await this.logStep('fetchFail', 'start', mid);
    errorLog([mid, fail_msg].join(' | '));
    if (fail_msg === 'Error: Request failed with status code 412') {
      await this.jobQueue.pause();
    }
    const $data = await this.upService.findByMid(mid);
    if ($data) return;
    return this.create({
      type: UpType.fail,
      mid,
      fail_msg,
    });
  }

  async fetch(mid: number) {
    await this.logStep('fetch', 'start', mid);
    const redisKey = cacheName(CacheType.up, mid);
    const redis = this.redisService.getClient('upCache');
    const data = await redis.get(redisKey);
    if (data) return this.create(JSON.parse(data) as UpDto, 'redis');
    const [e1, info] = await apiUserInfo(mid);
    if (e1) return this.failFetch(mid, e1.toString());
    if (info.code === -404) {
      return this.create({ type: UpType.deleted, mid });
    }
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

  async start(list: number[], from: UpFrom) {
    await this.jobQueue.addBulk(
      list.map((key) => ({
        name: 'upCrawler',
        data: { key, from },
      })),
    );
  }

  @Cron('0 */5 * * * *')
  async resume() {
    const isPaused = await this.jobQueue.isPaused();
    if (isPaused) {
      await this.jobQueue.resume();
    }
  }
  @Cron('0 0 * * * *')
  async retry() {
    const jobs = await this.jobQueue.getFailed();
    await this.jobQueue.clean(1000, 'failed');
    await this.jobQueue.clean(1000, 'completed');
    const list = await this.upService.findFail();
    const upList = list.map((i) => i.mid).concat(jobs.map((j) => j.data.key));
    await this.start(upList, UpFrom.RETRY);
    return upList.length;
  }

  @Cron('0 * * * * *')
  async update() {
    const isPaused = await this.jobQueue.isPaused();
    if (isPaused) return;
    const waitCount = await this.jobQueue.getWaitingCount();
    if (waitCount > 100) return;
    const list = await this.upService.findNeedUpdate(
      MagicNumber.UP_UPDATE_PER_MIN,
    );
    await this.start(
      list.map((i) => i.mid),
      UpFrom.UPDATE,
    );
  }

  async logStep(
    step: 'active' | 'fetch' | 'fetchFail' | 'create',
    status: 'start' | 'end',
    mid: number,
  ) {
    const redis = this.redisService.getClient('log');
    const [date, time] = dayjs().format('MM-DD|HH:mm:ss').split('|');
    const KEY = `${date}:${mid}`;
    await redis.hset(KEY, `${step}:${status}`, time);
    await redis.expire(KEY, expireTime(WEEK));
  }
}
