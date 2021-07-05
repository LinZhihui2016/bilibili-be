import { UpEntity } from './up.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpController } from './up.controller';
import { Module } from '@nestjs/common';
import { UpService } from './up.service';
import { BullModule } from '@nestjs/bull';
import { UpProcessor } from './up.processor';
import { UpCrawler } from './up.crawler';
import { CrawlerService } from '../crawler/crawler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UpEntity]),
    BullModule.registerQueueAsync({
      name: 'up',
    }),
  ],
  controllers: [UpController],
  providers: [UpService, UpProcessor, UpCrawler, CrawlerService],
  exports: [UpService],
})
export class UpModule {}
