import { VideoEntity } from './video.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoController } from './video.controller';
import { Module } from '@nestjs/common';
import { VideoService } from './video.service';

@Module({
  imports: [TypeOrmModule.forFeature([VideoEntity])],
  controllers: [VideoController],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
