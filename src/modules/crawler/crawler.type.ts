import { RankId } from '../rank/rank.entity';

export enum CrawlerType {
  RANK = 'rank',
  VIDEO = 'video',
  UP = 'up',
}

export enum JobRankFrom {
  CRON = 'cron',
}

export enum JobVideoFrom {
  RANK = 'rank',
  RETRY = 'retry',
  UPDATE = 'update',
}
export enum JobUpFrom {
  VIDEO = 'video',
  RETRY = 'retry',
  UPDATE = 'update',
}

export type JobFrom = JobRankFrom | JobVideoFrom | JobUpFrom;

export interface JobRankData {
  from: JobRankFrom;
  type: CrawlerType.RANK;
  key: RankId;
}

export interface JobVideoData {
  from: JobVideoFrom;
  type: CrawlerType.VIDEO;
  key: string;
}

export interface JobUpData {
  from: JobUpFrom;
  type: CrawlerType.UP;
  key: number;
}

export type JobData = JobRankData | JobVideoData | JobUpData;
