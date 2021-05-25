import { UpEntity } from './up.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpController } from './up.controller';
import { UpService } from './up.service';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'job',
    }),
    TypeOrmModule.forFeature([UpEntity]),
  ],
  controllers: [UpController],
  providers: [UpService],
  exports: [UpService],
})
export class UpModule {}
