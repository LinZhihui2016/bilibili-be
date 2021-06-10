import {
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { JwtGuard } from '../../jwt/jwt.guard';
import { CrawlerType } from './crawler.type';
import { JobStatus } from 'bull';
import { Checkbox } from '../../util/checkbox';

const jobStatus: JobStatus[] = ['completed', 'waiting', 'failed'];
const jobType: CrawlerType[] = [
  CrawlerType.RANK,
  CrawlerType.VIDEO,
  CrawlerType.UP,
];

@Controller('api3/admin')
export class CrawlerController {
  jobStatus = new Checkbox<JobStatus>(jobStatus);
  jobType = new Checkbox<CrawlerType>(jobType);

  constructor(private readonly adminService: CrawlerService) {}

  @Get('enum/list')
  enum() {
    const { jobType, jobStatus } = this;
    return {
      type: jobType.obj(),
      status: jobStatus.obj(),
    };
  }

  @Get('enum/test')
  enumTest(@Query() query) {
    const { v, k } = query;
    switch (k) {
      case 'type':
        return this.jobType.unzip(+v);
      case 'status':
        return this.jobStatus.unzip(+v);
    }
  }

  @UseGuards(JwtGuard)
  @Get('list')
  async list(@Query() query, @Req() req) {
    const { user } = req;
    if (!user) throw new UnauthorizedException();
    const { type, pageSize, page, status } = query;
    const statusArr = this.jobStatus.unzip(+status, ['waiting']);
    const typeArr = this.jobType.unzip(+type);
    return await this.adminService.getList(statusArr, typeArr, page, pageSize);
  }
}
