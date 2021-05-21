import { Controller, Get } from '@nestjs/common';
import { VideoService } from './video.service';
import mysql from 'mysql';

@Controller('api3/video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get()
  test() {
    const $mysql = mysql.createConnection({
      host: '119.23.41.42',
      user: 'root',
      password: 'lin060340',
      database: 'bilibili',
      charset: 'utf8mb4',
    });
    $mysql.query('select bvid from video', async (err, res) => {
      await this.videoService.start(res.map((i) => i.bvid));
    });
  }
}
