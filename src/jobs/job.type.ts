import { RankId } from '../modules/rank/rank.entity';

export enum JobType {
  Rank,
  Video,
  Up,
}

export interface JobRankData {
  type: JobType.Rank;
  key: RankId;
}

export interface JobVideoData {
  type: JobType.Video;
  key: string;
}

export interface JobUpData {
  type: JobType.Up;
  key: number;
}

export type JobData = JobRankData | JobVideoData | JobUpData;
