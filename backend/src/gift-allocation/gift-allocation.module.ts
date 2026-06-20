import { Module } from '@nestjs/common';
import { GiftAllocationService } from './gift-allocation.service';
import { GiftAllocationController } from './gift-allocation.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FreeGiftsModule } from '../free-gifts/free-gifts.module';

@Module({
  imports: [PrismaModule, FreeGiftsModule],
  providers: [GiftAllocationService],
  controllers: [GiftAllocationController],
  exports: [GiftAllocationService],
})
export class GiftAllocationModule {}
