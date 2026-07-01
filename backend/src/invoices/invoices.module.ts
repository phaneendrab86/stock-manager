import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CouponsModule } from '../coupons/coupons.module';
import { RewardSettingsModule } from '../reward-settings/reward-settings.module';
import { GiftAllocationModule } from '../gift-allocation/gift-allocation.module';

@Module({
  imports: [
    PrismaModule,
    CouponsModule,
    RewardSettingsModule,
    GiftAllocationModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
