import { RankEntity } from './rank.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankController } from './rank.controller';
import { RankService } from './rank.service';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { RankProcessor } from './rank.processor';
import { RankCrawler } from './rank.crawler';
import { CrawlerService } from '../crawler/crawler.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'rank' }, { name: 'video' }),
    TypeOrmModule.forFeature([RankEntity]),
  ],
  controllers: [RankController],
  providers: [RankService, RankProcessor, RankCrawler, CrawlerService],
  exports: [RankService],
})
export class RankModule {}
