import { UpEntity } from './up.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpController } from './up.controller';
import { Module } from '@nestjs/common';
import { UpService } from './up.service';

@Module({
  imports: [TypeOrmModule.forFeature([UpEntity])],
  controllers: [UpController],
  providers: [UpService],
  exports: [UpService],
})
export class UpModule {}
