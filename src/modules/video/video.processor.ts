import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { VideoCrawler } from './video.crawler';

export enum VideoFrom {
  RANK = 'rank',
  RETRY = 'retry',
  UPDATE = 'update',
}

export interface VideoJob {
  from: VideoFrom;
  key: string;
}

@Processor('video')
export class VideoProcessor {
  constructor(private readonly videoCrawler: VideoCrawler) {}

  @Process('videoCrawler')
  async active(job: Job<VideoJob>) {
    const { key, from } = job.data;
    await this.videoCrawler.fetch(key as string, from);
  }
}
