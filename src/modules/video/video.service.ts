import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VideoEntity, VideoType } from './video.entity';
import { In, Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { apiBvHtml, apiPgcInfo } from '../../crawler/video';
import cheerio from 'cheerio';
import {
  BangumiVideo,
  NormalVideo,
  VideoBangumiDto,
  VideoDto,
  VideoNormalDto,
} from './video.dto';
import dayjs from 'dayjs';
import { JobData, JobType, JobUpFrom, JobVideoFrom } from '../../jobs/job.type';
import { $val } from '../../util/mysql';
import { RedisService } from 'nestjs-redis';
import { cacheName, CacheType } from '../../util/redis';
import { HOUR } from '../../util/date';
import { errorLog } from '../../log4js/log';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    @InjectRepository(VideoEntity)
    private readonly videoRepository: Repository<VideoEntity>,
    @InjectQueue('job') private jobQueue: Queue<JobData>,
    private readonly redisService: RedisService,
  ) {}

  async create(data: VideoDto) {
    const { bvid } = data;
    const $data = await this.videoRepository.findOne({ where: { bvid } });
    const $$data = await $val($data || new VideoEntity(), data);
    if (data.type !== VideoType.fail) {
      $$data.fail_msg = '';
    }
    const redis = this.redisService.getClient();
    const redisKey = cacheName(CacheType.video, bvid);
    await redis.set(redisKey, JSON.stringify($$data));
    await redis.expire(redisKey, HOUR);
    this.logger.log(redisKey);
    return await this.videoRepository.save($$data);
  }

  async failFetch(bvid: string, fail_msg: string) {
    const $data = await this.videoRepository.findOne({ where: { bvid } });
    if ($data) return;
    errorLog([bvid, fail_msg].join(' | '));
    return this.create({
      type: VideoType.fail,
      bvid,
      fail_msg,
    });
  }

  async fetch(bv: string) {
    const redisKey = cacheName(CacheType.video, bv);
    const data = await this.redisService.getClient().get(redisKey);
    if (data) return this.create(JSON.parse(data) as VideoDto);
    const [err, html] = await apiBvHtml(bv);
    if (err) return this.failFetch(bv, err.toString());
    const $ = cheerio.load(html);
    if ($('.error-body .error-text').text()) {
      return this.create({ type: VideoType.deleted, bvid: bv });
    }
    const match = html.match(/window.__INITIAL_STATE__=(.*]});/);
    if (!match) {
      return this.failFetch(bv, '获取INITIAL_STATE失败');
    }
    let json: BangumiVideo | NormalVideo | null = null;
    try {
      json = JSON.parse(match[1]);
    } catch (e) {
      return this.failFetch(bv, '解析INITIAL_STATE失败');
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
        await this.jobQueue.add('crawler', {
          type: JobType.Up,
          key: +mid,
          from: JobUpFrom.VIDEO,
        });
        return this.create(normalBv);
      } else if ('mediaInfo' in json) {
        const {
          h1Title: title,
          epInfo: { id, aid, bvid, cover: pic },
          mediaInfo: { upInfo },
        } = json;
        const [err, info] = await apiPgcInfo(id);
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
        await this.jobQueue.add('crawler', {
          type: JobType.Up,
          key: +upInfo.mid,
          from: JobUpFrom.VIDEO,
        });
        return this.create(bangumiBv);
      }
    } catch (e) {
      return this.failFetch(bv, e.message);
    }
  }

  async start(list: string[], from: JobVideoFrom) {
    await this.jobQueue.addBulk(
      list.map((key) => ({
        name: 'crawler',
        data: { type: JobType.Video, key, from },
      })),
    );
  }

  @Cron('0 0 * * * *')
  async retry() {
    const list = await this.videoRepository.find({
      where: { type: VideoType.fail + '' },
    });
    const bvList = list.map((i) => i.bvid);
    await this.start(bvList, JobVideoFrom.RETRY);
    return bvList.length;
  }

  @Cron('30 * * * * *')
  async update() {
    const waitCount = await this.jobQueue.getWaitingCount();
    if (waitCount > 100) return;
    const list = await this.videoRepository.find({
      where: {
        type: In([VideoType.normal + '', VideoType.bangumi + '']),
      },
      order: {
        updated: 'ASC',
      },
      take: 2,
    });
    await this.start(
      list.map((i) => i.bvid),
      JobVideoFrom.UPDATE,
    );
  }
}
