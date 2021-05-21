import { video } from '../fetch';
import { pgc } from '../axios';
import { BiliBiliApi } from './index';

export interface BangumiInfo {
  stat: {
    //没有收藏和分享
    coin: number;
    dm: number;
    like: number;
    reply: number;
    view: number;
  };
}

export const apiBvHtml = (bv: string) => video.$(bv);
export const apiPgcInfo = (ep_id: number) =>
  pgc.$<BiliBiliApi<BangumiInfo>>('season/episode/web/info', { ep_id });
