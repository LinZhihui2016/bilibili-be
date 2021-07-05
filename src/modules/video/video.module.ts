import { VideoEntity } from './video.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoController } from './video.controller';
import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { BullModule } from '@nestjs/bull';
import { VideoProcessor } from './video.processor';
import { VideoCrawler } from './video.crawler';
import { CrawlerService } from '../crawler/crawler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoEntity]),
    BullModule.registerQueueAsync({ name: 'video' }, { name: 'up' }),
  ],
  controllers: [VideoController],
  providers: [VideoProcessor, VideoService, VideoCrawler, CrawlerService],
  exports: [VideoService],
})
export class VideoModule {}
