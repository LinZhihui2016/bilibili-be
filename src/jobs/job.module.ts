import { Module } from '@nestjs/common';
import { JobCron } from './job.cron';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'job',
    }),
  ],
  providers: [JobCron],
})
export class JobModule {}
