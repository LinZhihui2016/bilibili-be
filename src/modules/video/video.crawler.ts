import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { VideoFrom, VideoJob } from './video.processor';
import { RedisService } from 'nestjs-redis';
import { VideoService } from './video.service';
import {
  BangumiVideo,
  NormalVideo,
  VideoBangumiDto,
  VideoDto,
  VideoNormalDto,
} from './video.dto';
import { $val } from '../../util/mysql';
import { VideoEntity, VideoType } from './video.entity';
import { cacheName, CacheType } from '../../util/redis';
import { expireTime, MINUTE, sleep, WEEK } from '../../util/date';
import { errorLog } from '../../log4js/log';
import cheerio from 'cheerio';
import dayjs from 'dayjs';
import { Cron } from '@nestjs/schedule';
import { UpFrom, UpJob } from '../up/up.processor';
import { MagicNumber } from '../../util/magicNumber';
import { CrawlerService } from '../crawler/crawler.service';

@Injectable()
export class VideoCrawler {
  private readonly logger = new Logger(VideoCrawler.name);

  private log(k: string, f: string) {
    this.logger.log([k, 'from', f].join(' '));
  }

  constructor(
    @InjectQueue('video')
    private jobQueue: Queue<VideoJob>,
    @InjectQueue('up')
    private upJobQueue: Queue<UpJob>,
    private readonly redisService: RedisService,
    private readonly videoService: VideoService,
    private crawlerService: CrawlerService,
  ) {}

  async fetchUp(mid: number) {
    await this.upJobQueue.add('upCrawler', { from: UpFrom.VIDEO, key: mid });
  }

  async create(data: VideoDto, from = 'crawler') {
    const { bvid } = data;
    await this.logStep('create', 'start', bvid);
    const $data = await this.videoService.findByBvid(bvid);
    const $$data = await $val($data || new VideoEntity(), data);
    if (data.type !== VideoType.fail) {
      $$data.fail_msg = '';
    }
    $$data.crawlerTimes = ($$data.crawlerTimes || 0) + 1;
    const redis = this.redisService.getClient('videoCache');
    const redisKey = cacheName(CacheType.video, bvid);
    await redis.set(redisKey, JSON.stringify($$data));
    await redis.expire(redisKey, expireTime(MINUTE * 10));
    const saveData = await this.videoService.save($$data);
    this.log(redisKey, from);
    if (from === 'crawler') {
      await sleep(3000);
    }
    await this.logStep('create', 'end', bvid);
    return saveData;
  }

  async failFetch(bvid: string, fail_msg: string) {
    await this.logStep('fetchFail', 'start', bvid);
    errorLog([bvid, fail_msg].join(' | '));
    await this.jobQueue.pause();
    const $data = await this.videoService.findByBvid(bvid);
    if ($data) return;
    return this.create({
      type: VideoType.fail,
      bvid,
      fail_msg,
    });
  }

  async fetch(bv: string, from: VideoFrom) {
    await this.logStep('fetch', 'start', bv);
    const redisKey = cacheName(CacheType.video, bv);
    const redis = this.redisService.getClient('videoCache');
    const data = await redis.get(redisKey);
    if (data) return this.create(JSON.parse(data) as VideoDto);
    const [err, html] = await this.crawlerService.apiBvHtml(bv);
    if (err) return this.failFetch(bv, err.toString());
    await this.logStep('fetch', 'end', bv);
    const $ = cheerio.load(html);
    if ($('.error-body .error-text').text()) {
      return this.create({ type: VideoType.deleted, bvid: bv });
    }
    const match = html.match(/window.__INITIAL_STATE__=(.*]});/);
    if (!match) {
      return this.failFetch(bv, '??????INITIAL_STATE??????');
    }
    let json: BangumiVideo | NormalVideo | null = null;
    try {
      json = JSON.parse(match[1]);
    } catch (e) {
      return this.failFetch(bv, '??????INITIAL_STATE??????');
    }
    try {
      if ('videoData' in json) {
        const {
          videoData: {
            stat: { view, danmaku, reply, favorite, coin, share, like },
            bvid,
            aid,
            title,
            pic,
            pubdate,
            desc,
          },
          upData: { name, mid },
        } = json;
        const normalBv: VideoNormalDto = {
          up_mid: +mid,
          up_name: name,
          bvid,
          aid,
          title,
          pic,
          pubdate: dayjs(pubdate * 1000).toDate(),
          desc,
          views: view,
          danmaku,
          reply,
          favorite,
          coin,
          share,
          likes: like,
          type: VideoType.normal,
        };
        from === VideoFrom.RANK && (await this.fetchUp(+mid));
        return this.create(normalBv);
      } else if ('mediaInfo' in json) {
        const {
          h1Title: title,
          epInfo: { id, aid, bvid, cover: pic },
          mediaInfo: { upInfo },
        } = json;
        const [err, info] = await this.crawlerService.apiPgcInfo(id);
        if (err)
          return this.create({
            type: VideoType.fail,
            bvid: bv,
            fail_msg: err.toString(),
          });
        const {
          data: { stat },
        } = info;
        const { coin, dm: danmaku, like, reply, view } = stat;
        const bangumiBv: VideoBangumiDto = {
          aid,
          bvid,
          epId: id,
          title,
          type: VideoType.bangumi,
          coin,
          danmaku,
          likes: like,
          reply,
          views: view,
          pic,
          up_name: upInfo.name,
          up_mid: upInfo.mid,
        };
        from === VideoFrom.RANK && (await this.fetchUp(+upInfo.mid));
        return this.create(bangumiBv);
      }
    } catch (e) {
      return this.failFetch(bv, e.message);
    }
  }

  async start(list: string[], from: VideoFrom) {
    await this.jobQueue.addBulk(
      list.map((key) => ({
        name: 'videoCrawler',
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

    const list = await this.videoService.findFail();
    const bvList = list.map((i) => i.bvid).concat(jobs.map((j) => j.data.key));
    await this.start(bvList, VideoFrom.RETRY);
    return bvList.length;
  }

  @Cron('30 * * * * *')
  async update() {
    const isPaused = await this.jobQueue.isPaused();
    if (isPaused) return;
    const waitCount = await this.jobQueue.getWaitingCount();
    if (waitCount > 100) return;
    const list = await this.videoService.findNeedUpdate(
      MagicNumber.VIDEO_UPDATE_PER_MIN,
    );
    await this.start(
      list.map((i) => i.bvid),
      VideoFrom.UPDATE,
    );
  }

  async logStep(
    step: 'active' | 'fetch' | 'fetchFail' | 'create',
    status: 'start' | 'end',
    bv: string,
  ) {
    const redis = this.redisService.getClient('log');
    const [date, time] = dayjs().format('MM-DD|HH:mm:ss').split('|');
    const KEY = `video:${date}:${bv}`;
    await redis.hset(KEY, `${step}:${status}`, time);
    await redis.expire(KEY, expireTime(WEEK));
  }
}
