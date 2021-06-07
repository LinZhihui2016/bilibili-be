import {
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtGuard } from '../../jwt/jwt.guard';
import { JobType } from '../../jobs/job.type';
import { JobStatus } from 'bull';
import { Checkbox } from '../../util/checkbox';

const jobStatus: JobStatus[] = [
  'completed',
  'waiting',
  'active',
  'delayed',
  'failed',
  'paused',
];
const jobType: JobType[] = [JobType.Rank, JobType.Video, JobType.Up];

@Controller('api3/admin')
export class AdminController {
  jobStatus = new Checkbox<JobStatus>(jobStatus);
  jobType = new Checkbox<JobType>(jobType);

  constructor(private readonly adminService: AdminService) {}

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
