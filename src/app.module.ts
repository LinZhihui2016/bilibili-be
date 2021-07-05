import { Module } from '@nestjs/common';
import { resolve } from 'path';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from 'nestjs-redis';
import { BullModule } from '@nestjs/bull';
import { UserModule } from './modules/user/user.module';
import { UpModule } from './modules/up/up.module';
import { VideoModule } from './modules/video/video.module';
import { RankModule } from './modules/rank/rank.module';
import { CrawlerModule } from './modules/crawler/crawler.module';
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
    UserModule,
    UpModule,
    VideoModule,
    RankModule,
    CrawlerModule,
  ],
})
export class AppModule {}
