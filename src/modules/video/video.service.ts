import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, ObjectLiteral, Repository } from 'typeorm';
import { VideoEntity, VideoType } from './video.entity';
import { listParams } from '../../util/mysql';
import { Alias } from '../../type';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import $EntityFieldsNames = Alias.$EntityFieldsNames;

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(VideoEntity)
    private readonly videoRepository: Repository<VideoEntity>,
  ) {}

  async getList(
    opt: {
      page: string;
      pageSize: string;
      orderby?: Alias.OrderBy;
      orderKey?: $EntityFieldsNames<VideoEntity>;
    },
    type: keyof typeof VideoType | 'all',
  ) {
    const where: FindOneOptions<VideoEntity>['where'] = {};
    if (Object.keys(VideoType).includes(VideoType[type])) {
      where.type = VideoType[type];
    } else if (type !== 'all') {
      where.type = In([VideoType.bangumi, VideoType.normal]);
    }
    const [list, count] = await this.videoRepository.findAndCount({
      ...listParams({
        ...opt,
        orderList: ['likes', 'danmaku', 'favorite', 'views', 'coin', 'reply'],
      }),
      where,
    });
    return { list, count };
  }

  async findByBvid(bvid: string) {
    return await this.videoRepository.findOne({ where: { bvid } });
  }

  async save(data: ObjectLiteral) {
    return await this.videoRepository.save(data);
  }

  async findFail() {
    return await this.videoRepository.find({
      where: { type: VideoType.fail },
    });
  }

  async findNeedUpdate(take = 2) {
    return await this.videoRepository.find({
      where: {
        type: In([VideoType.normal, VideoType.bangumi]),
      },
      order: {
        updated: 'ASC',
      },
      take,
    });
  }
}
