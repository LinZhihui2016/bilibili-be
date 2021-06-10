import { Injectable } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RankEntity, RankId } from './rank.entity';
import dayjs from 'dayjs';

@Injectable()
export class RankService {
  constructor(
    @InjectRepository(RankEntity)
    private readonly rankRepository: Repository<RankEntity>,
  ) {}

  async save(data: ObjectLiteral) {
    return await this.rankRepository.save(data);
  }

  async findToday(day: dayjs.Dayjs) {
    return await this.rankRepository.find({
      where: {
        date: day.toDate(),
      },
    });
  }

  async find(rid: RankId, day: dayjs.Dayjs) {
    return await this.rankRepository.findOne({
      where: { rid: rid + '', date: day.toDate() },
    });
  }
}
