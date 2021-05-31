import { VideoEntity } from './video.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoController } from './video.controller';
import { VideoCrawler } from './video.crawler';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { VideoService } from './video.service';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'job',
    }),
    TypeOrmModule.forFeature([VideoEntity]),
  ],
  controllers: [VideoController],
  providers: [VideoCrawler, VideoService],
  exports: [VideoCrawler, VideoService],
})
export class VideoModule {}
