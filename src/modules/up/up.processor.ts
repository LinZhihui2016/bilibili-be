import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { UpCrawler } from './up.crawler';
import { RedisService } from 'nestjs-redis';

export enum UpFrom {
  VIDEO = 'video',
  RETRY = 'retry',
  UPDATE = 'update',
}

export interface UpJob {
  from: UpFrom;
  key: number;
}

@Processor('up')
export class UpProcessor {
  constructor(
    private readonly upCrawler: UpCrawler,
    private readonly redisService: RedisService,
  ) {}

  @Process('upCrawler')
  async active(job: Job<UpJob>) {
    const { key } = job.data;
    const mid = +key;
    setTimeout(async () => {
      if (!(await job.isCompleted())) {
        await job.moveToFailed({ message: 'time out' });
        const redis = this.redisService.getClient('log');
        await redis.set(`up:${key}`, 'time out');
      }
    }, 60000);
    await this.upCrawler.logStep('active', 'start', key);
    await this.upCrawler.fetch(mid);
    await this.upCrawler.logStep('active', 'end', key);
  }
}
