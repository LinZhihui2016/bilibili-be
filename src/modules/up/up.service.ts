import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpEntity } from './up.entity';
import { Repository } from 'typeorm';
import { initPagination } from '../../util/mysql';

@Injectable()
export class UpService {
  constructor(
    @InjectRepository(UpEntity)
    private readonly upRepository: Repository<UpEntity>,
  ) {}

  async getList(opt: { page: string; pageSize: string }) {
    return await this.upRepository.findAndCount({
      ...initPagination(opt),
      order: {
        follower: 'DESC',
      },
    });
  }
}
