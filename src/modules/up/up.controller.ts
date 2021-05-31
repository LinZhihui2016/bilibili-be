import { Controller, Get, Query } from '@nestjs/common';
import { UpService } from './up.service';

@Controller('api3/up')
export class UpController {
  constructor(private readonly upService: UpService) {}

  @Get('')
  async list(@Query() query) {
    const { page = '1', pageSize = '10' } = query;
    return this.upService.getList({ page, pageSize });
  }
}
