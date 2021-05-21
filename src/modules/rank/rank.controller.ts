import { Controller, Get } from '@nestjs/common';
import { RankService } from './rank.service';

@Controller('api/rank')
export class RankController {
  constructor(private readonly rankService: RankService) {}

  @Get()
  test() {
    return this.rankService.addRankJob();
  }
}
