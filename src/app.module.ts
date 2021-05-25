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
    ScheduleModule.forRoot(),
    RankModule,
    VideoModule,
    UpModule,
    // JobModule,
  ],
  providers: [JobProcessor],
})
export class AppModule {}
