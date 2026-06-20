import { Module } from '@nestjs/common';
import { FreeGiftsService } from './free-gifts.service';
import { FreeGiftsController } from './free-gifts.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FreeGiftsService],
  controllers: [FreeGiftsController],
  exports: [FreeGiftsService],
})
export class FreeGiftsModule {}
