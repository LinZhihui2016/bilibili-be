import { Module } from '@nestjs/common';
import { UpCrawler } from './up.crawler';
import { VideoCrawler } from './video.crawler';
import { CrawlerProcessor } from './crawler.processor';
import { CrawlerCron } from './crawler.cron';
import { BullModule } from '@nestjs/bull';
import { UpModule } from '../up/up.module';
import { VideoModule } from '../video/video.module';
import { RankModule } from '../rank/rank.module';
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'job',
    }),
    UpModule,
    VideoModule,
    RankModule,
  ],
  controllers: [CrawlerController],
  providers: [
    CrawlerService,
    UpCrawler,
    VideoCrawler,
    CrawlerProcessor,
    CrawlerCron,
  ],
})
export class CrawlerModule {}
