import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'job',
    }),
  ],
  providers: [JobService],
})
export class JobModule {}
