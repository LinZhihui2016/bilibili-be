import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoEntity } from './video.entity';
import { initPagination } from '../../util/mysql';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(VideoEntity)
    private readonly videoRepository: Repository<VideoEntity>,
  ) {}

  async getList(opt: { page: string; pageSize: string }) {
    return await this.videoRepository.findAndCount({
      ...initPagination(opt),
      order: {
        views: 'DESC',
      },
    });
  }
}
