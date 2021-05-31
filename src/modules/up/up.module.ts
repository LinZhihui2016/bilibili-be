import { UpEntity } from './up.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpController } from './up.controller';
import { UpCrawler } from './up.crawler';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { UpService } from './up.service';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'job',
    }),
    TypeOrmModule.forFeature([UpEntity]),
  ],
  controllers: [UpController],
  providers: [UpCrawler, UpService],
  exports: [UpCrawler, UpService],
})
export class UpModule {}
