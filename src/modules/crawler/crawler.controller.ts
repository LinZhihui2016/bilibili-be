import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { JwtGuard } from '../../jwt/jwt.guard';

@Controller('api3/crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @UseGuards(JwtGuard)
  @Post('cookie')
  async setCookie(@Body() body) {
    const { cookie } = body;
    return await this.crawlerService.setCookie(cookie);
  }
}
