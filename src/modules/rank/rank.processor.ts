import { RankId } from './rank.entity';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { RankCrawler } from './rank.crawler';

export enum RankFrom {
  CRON = 'cron',
}

export interface RankJob {
  from: RankFrom;
  key: RankId;
}

@Processor('rank')
export class RankProcessor {
  constructor(private readonly rankCrawler: RankCrawler) {}

  @Process('rankCrawler')
  async active(job: Job<RankJob>) {
    const { key } = job.data;
    if (key === -1) {
      await this.rankCrawler.count();
    } else {
      await this.rankCrawler.fetch(key as RankId);
    }
  }
}
