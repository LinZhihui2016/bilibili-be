import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JobData } from './crawler.type';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CrawlerCron {
  constructor(@InjectQueue('job') private jobQueue: Queue<JobData>) {}

  @Cron('0 0 * * * *')
  async clean() {
    await this.jobQueue.clean(1000, 'completed');
  }

  @Cron('0 0 * * * *')
  async retry() {
    const jobs = await this.jobQueue.getFailed();
    await this.jobQueue.addBulk(jobs.map(({ name, data }) => ({ name, data })));
    await this.jobQueue.clean(1000, 'failed');
  }
}
