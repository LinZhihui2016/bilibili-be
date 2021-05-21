import { RankEntity } from './rank.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankController } from './rank.controller';
import { RankService } from './rank.service';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'job',
    }),
    TypeOrmModule.forFeature([RankEntity]),
  ],
  controllers: [RankController],
  providers: [RankService],
  exports: [RankService],
})
export class RankModule {}
