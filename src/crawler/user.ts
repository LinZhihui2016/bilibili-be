import { BiliBiliApi } from './index';
import { api } from '../axios';

export interface UserStat {
  mid: number;
  following: number;
  whisper: number;
  black: number;
  follower: number;
}

export interface UserUpstat {
  archive: { view: number };
  article: { view: number };
  likes: number;
}

export interface UserInfo {
  face: string;
  name: string;
  mid: number;
  sign: string;
}

export const apiUserStat = (vmid: number) =>
  api.$<BiliBiliApi<UserStat>>('relation/stat', { vmid, jsonp: 'jsonp' });
export const apiUserUpstat = (mid: number) =>
  api.$<BiliBiliApi<UserUpstat>>('space/upstat', { mid, jsonp: 'jsonp' });
export const apiUserInfo = (mid: number) =>
  api.$<BiliBiliApi<UserInfo>>('space/acc/info', { mid, jsonp: 'jsonp' });
