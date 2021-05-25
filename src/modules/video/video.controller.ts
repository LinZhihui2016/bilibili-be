import { Controller, Get } from '@nestjs/common';
import { VideoService } from './video.service';

@Controller('api3/video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get()
  async test() {
    return await this.videoService.retry();
    // return await this.videoService.fetch('BV11K4y1A7HH');
  }
}
