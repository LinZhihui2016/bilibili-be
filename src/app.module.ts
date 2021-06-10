import { Module } from '@nestjs/common';
import { resolve } from 'path';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankModule } from './modules/rank/rank.module';
import { VideoModule } from './modules/video/video.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from 'nestjs-redis';
import { JobProcessor } from './jobs/job.processor';
import { BullModule } from '@nestjs/bull';
import { UpModule } from './modules/up/up.module';
import { UserModule } from './modules/user/user.module';
import { AdminModule } from './modules/admin/admin.module';
import { VideoCrawler } from './modules/video/video.crawler';
import { UpCrawler } from './modules/up/up.crawler';
import { JobCron } from './jobs/job.cron';

@Module({
  imports: [
    ConfigModule.load(resolve(__dirname, 'config', '!(*.d).{ts,js}')),
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        return config.get('queue');
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        return config.get('mysql');
      },
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        return config.get('redis');
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueueAsync({
      name: 'job',
    }),
    ScheduleModule.forRoot(),
    RankModule,
    VideoModule,
    UpModule,
    UserModule,
    AdminModule,
    // AuthModule,
  ],
  providers: [UpCrawler, VideoCrawler, JobProcessor, JobCron],
})
export class AppModule {}
