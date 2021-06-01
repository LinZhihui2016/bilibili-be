import { Controller, Get, Query } from '@nestjs/common';
import { VideoService } from './video.service';

@Controller('api3/video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get()
  async list(@Query() query) {
    const { page, pageSize, orderKey, orderby, type } = query;

    return await this.videoService.getList(
      {
        page,
        pageSize,
        orderKey,
        orderby,
      },
      type,
    );
  }
}
