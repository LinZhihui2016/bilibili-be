import { IsString } from 'class-validator';
import { VideoType } from './video.entity';
export interface NormalVideo {
  videoData: {
    bvid: string;
    aid: number;
    title: string;
    pic: string;
    pubdate: number; //发布时间
    desc: string;
    stat: {
      view: number;
      danmaku: number;
      reply: number;
      favorite: number;
      coin: number;
      share: number;
      like: number;
    };
  };
  upData: {
    mid: string;
    name: string;
  };
}

export interface BangumiVideo {
  h1Title: string;
  epInfo: {
    id: number;
    aid: number;
    bvid: string;
    cover: string;
  };
  mediaInfo: {
    upInfo: {
      name: string;
      mid: number;
    };
  };
}

export class VideoDeletedDto {
  @IsString()
  bvid: string;

  type: VideoType.deleted;
}
export class VideoFailDto {
  @IsString()
  bvid: string;

  type: VideoType.fail;
  fail_msg: string;
}
export class VideoBaseDto {
  @IsString()
  bvid: string;

  aid: number;
  title: string;
  pic: string;
  views: number;
  danmaku: number;
  reply: number;
  coin: number;
  likes: number;
  up_mid: number;
  up_name: string;
}
export class VideoNormalDto extends VideoBaseDto {
  type: VideoType.normal;

  favorite: number;
  share: number;
  pubdate: Date;
  desc: string;
}

export class VideoBangumiDto extends VideoBaseDto {
  type: VideoType.bangumi;
  epId: number; //bangumi
}

export type VideoDto =
  | VideoDeletedDto
  | VideoFailDto
  | VideoNormalDto
  | VideoBangumiDto;
