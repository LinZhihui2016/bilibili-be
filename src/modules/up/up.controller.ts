import {
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UpService } from './up.service';
import { JwtGuard } from '../../jwt/jwt.guard';
import { Checkbox } from '../../util/checkbox';
import { JobStatus } from 'bull';

@Controller('api3/up')
export class UpController {
  constructor(private readonly upService: UpService) {}

  jobStatus = new Checkbox<JobStatus>(['completed', 'waiting', 'failed']);

  @Get('')
  async list(@Query() query) {
    const { page, pageSize, orderKey, orderby, type } = query;
    return this.upService.getList({ page, pageSize, orderKey, orderby }, type);
  }

  @UseGuards(JwtGuard)
  @Get('queue')
  async queue(@Query() query, @Req() req) {
    const { user } = req;
    if (!user) throw new UnauthorizedException();
    const { pageSize, page, status } = query;
    const statusArr = this.jobStatus.unzip(+status, ['waiting']);
    return await this.upService.getQueue(statusArr, page, pageSize);
  }
}
