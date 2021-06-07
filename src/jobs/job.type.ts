import { RankId } from '../modules/rank/rank.entity';

export enum JobType {
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
  type: JobType.RANK;
  key: RankId;
}

export interface JobVideoData {
  from: JobVideoFrom;
  type: JobType.VIDEO;
  key: string;
}

export interface JobUpData {
  from: JobUpFrom;
  type: JobType.UP;
  key: number;
}

export type JobData = JobRankData | JobVideoData | JobUpData;
