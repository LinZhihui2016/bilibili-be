import { Injectable } from '@nestjs/common';
import { NodeFetch } from './fetch';
import NodeAxios from './axios';
import { AXIOS_OPTION } from './static';
import {
  BangumiInfo,
  BiliBiliApi,
  Ranking,
  UserInfo,
  UserStat,
  UserUpstat,
} from './type';
import { RedisService } from 'nestjs-redis';
import { ErrBase, ResException } from '../../util/error';
import { RankId } from '../rank/rank.entity';

@Injectable()
export class CrawlerService {
  videoBase = 'https://www.bilibili.com/video';
  apiBase = 'https://api.bilibili.com/x';
  pgcBase = 'https://api.bilibili.com/pgc';

  constructor(private readonly redisService: RedisService) {}

  async apiBvHtml(bv: string) {
    const redis = this.redisService.getClient('config');
    const cookie = await redis.get('cookie');
    const fetch = new NodeFetch(this.videoBase, { method: 'GET' });
    return fetch.$(bv, {}, { headers: { cookie } });
  }

  async apiPgcInfo(ep_id: number) {
    const api = new NodeAxios(
      AXIOS_OPTION(...(await this.getOption(this.pgcBase))),
    );
    return api.$<BiliBiliApi<BangumiInfo>>('season/episode/web/info', {
      ep_id,
    });
  }

  async apiUserStat(vmid: number) {
    const api = new NodeAxios(
      AXIOS_OPTION(...(await this.getOption(this.apiBase))),
    );
    return api.$<BiliBiliApi<UserStat>>('relation/stat', {
      vmid,
      jsonp: 'jsonp',
    });
  }

  async apiUserUpstat(mid: number) {
    const api = new NodeAxios(
      AXIOS_OPTION(...(await this.getOption(this.apiBase))),
    );
    return api.$<BiliBiliApi<UserUpstat>>('space/upstat', {
      mid,
      jsonp: 'jsonp',
    });
  }

  async apiUserInfo(mid: number) {
    const api = new NodeAxios(
      AXIOS_OPTION(...(await this.getOption(this.apiBase))),
    );
    return api.$<BiliBiliApi<UserInfo>>('space/acc/info', {
      mid,
      jsonp: 'jsonp',
    });
  }

  async apiRank(rid: RankId) {
    const api = new NodeAxios(
      AXIOS_OPTION(...(await this.getOption(this.apiBase))),
    );
    return api.$<BiliBiliApi<{ list: Ranking[] }>>('web-interface/ranking/v2', {
      rid,
      jsonp: 'jsonp',
    });
  }

  async getOption(apiBase: string): Promise<[string, string]> {
    const redis = this.redisService.getClient('config');
    const cookie = await redis.get('cookie');
    return [apiBase, cookie];
  }

  async setCookie(cookie: string) {
    const redis = this.redisService.getClient('config');
    try {
      return await redis.set('cookie', cookie);
    } catch (e) {
      throw new ResException(ErrBase.cookie错误, e.message);
    }
  }
}
