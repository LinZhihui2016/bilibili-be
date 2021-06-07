import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'job',
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
