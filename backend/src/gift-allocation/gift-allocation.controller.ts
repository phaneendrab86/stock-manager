import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GiftAllocationService } from './gift-allocation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/rewards/allocation')
@UseGuards(JwtAuthGuard)
export class GiftAllocationController {
  constructor(private giftAllocationService: GiftAllocationService) {}

  @Get('preview/:maxValue')
  preview(@Param('maxValue') maxValue: string) {
    return this.giftAllocationService.previewAllocation(parseFloat(maxValue));
  }
}
