import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { UpCrawler } from './up.crawler';

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
  constructor(private readonly upCrawler: UpCrawler) {}

  @Process('upCrawler')
  async active(job: Job<UpJob>) {
    const { key } = job.data;
    const mid = +key;
    await this.upCrawler.fetch(mid);
  }
}
