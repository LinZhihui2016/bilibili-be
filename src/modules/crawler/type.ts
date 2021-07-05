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

export interface Ranking {
  bvid: string;
  owner: {
    mid: number;
  };
}

export interface BiliBiliApi<T> {
  code: 0 | -404;
  data: T;
  ttl: 1;
  message: string;
}
