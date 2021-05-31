import { RankId } from '../modules/rank/rank.entity';

export enum JobType {
  Rank,
  Video,
  Up,
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
  type: JobType.Rank;
  key: RankId;
}

export interface JobVideoData {
  from: JobVideoFrom;
  type: JobType.Video;
  key: string;
}

export interface JobUpData {
  from: JobUpFrom;
  type: JobType.Up;
  key: number;
}

export type JobData = JobRankData | JobVideoData | JobUpData;
