import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { VideoCrawler } from './video.crawler';
import { RedisService } from 'nestjs-redis';

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
  constructor(
    private readonly videoCrawler: VideoCrawler,
    private readonly redisService: RedisService,
  ) {}

  @Process('videoCrawler')
  async active(job: Job<VideoJob>) {
    const { key, from } = job.data;
    setTimeout(async () => {
      if (!(await job.isCompleted())) {
        await job.moveToFailed({ message: 'time out' });
        const redis = this.redisService.getClient('log');
        await redis.set(`video:${key}`, 'time out');
      }
    }, 10000);
    await this.videoCrawler.logStep('active', 'start', key);
    await this.videoCrawler.fetch(key as string, from);
    await this.videoCrawler.logStep('active', 'end', key);
  }
}
