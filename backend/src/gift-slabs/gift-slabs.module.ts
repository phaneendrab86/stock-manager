import { Module } from '@nestjs/common';
import { GiftSlabsService } from './gift-slabs.service';
import { GiftSlabsController } from './gift-slabs.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [GiftSlabsService],
  controllers: [GiftSlabsController],
  exports: [GiftSlabsService],
})
export class GiftSlabsModule {}
