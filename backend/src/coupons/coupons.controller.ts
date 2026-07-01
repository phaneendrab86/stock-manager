import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('coupons')
@UseGuards(JwtAuthGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  async findAll() {
    return this.couponsService.findAll();
  }

  @Get('customer/:customerId')
  async findByCustomer(@Param('customerId') customerId: string) {
    return this.couponsService.findActiveByCustomer(customerId);
  }

  @Get('validate')
  async validate(
    @Query('code') code: string,
    @Query('customerId') customerId: string,
    @Query('billingType') billingType: string,
    @Query('paymentMode') paymentMode: string,
    @Query('eligibleAmount') eligibleAmount: string,
  ) {
    return this.couponsService.validateCoupon(
      code,
      customerId,
      billingType,
      paymentMode,
      parseFloat(eligibleAmount),
    );
  }
}
