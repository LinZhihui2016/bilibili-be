import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { JobData, JobType } from './job.type';
import { sleep } from '../util/date';
import { RankService } from '../modules/rank/rank.service';
import { RankId } from '../modules/rank/rank.entity';
import { VideoService } from '../modules/video/video.service';
import { UpService } from '../modules/up/up.service';

@Processor('job')
export class JobProcessor {
  constructor(
    private readonly rankService: RankService,
    private readonly videoService: VideoService,
    private readonly upService: UpService,
  ) {}

  @Process('crawler')
  async crawlerWork(job: Job<JobData>) {
    const { key, type } = job.data;
    switch (type) {
      case JobType.Rank:
        if (key === -1) {
          await this.rankService.count();
          await sleep(1000);
        } else {
          await this.rankService.fetch(key as RankId);
          await sleep(3000);
        }
        break;
      case JobType.Up:
        const mid = +key;
        if (isNaN(mid)) return;
        await this.upService.fetch(mid);
        await sleep(10000);
        break;
      case JobType.Video:
        await this.videoService.fetch(key as string);
        await sleep(3000);
        break;
    }
  }
}
