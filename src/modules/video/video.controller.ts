import { Controller, Get } from '@nestjs/common';
import { VideoService } from './video.service';

@Controller('api3/video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get()
  async test() {
    await this.videoService.retry();
    return 'OK';
  }
}
