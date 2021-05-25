import { Controller, Get } from '@nestjs/common';
import { UpService } from './up.service';

@Controller('api3/up')
export class UpController {
  constructor(private readonly upService: UpService) {}

  @Get('test')
  async test() {
    return this.upService.start([930699720]);
  }
}
