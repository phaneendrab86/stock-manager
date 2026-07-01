import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Delete,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Get(':id/profile')
  getProfile(@Param('id') id: string) {
    return this.customersService.getProfile(id);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string, @Query() filters: any) {
    return this.customersService.getHistory(id, filters);
  }

  @Post(':id/payments')
  recordPayment(
    @Param('id') id: string,
    @Body() body: { amount: number; paymentMode: string; note?: string },
  ) {
    return this.customersService.recordPayment(id, body);
  }

  @Post(':id/ledger')
  recordLedgerEntry(
    @Param('id') id: string,
    @Body()
    body: {
      amount: number;
      type: 'DEBIT' | 'CREDIT';
      description: string;
      paymentMode?: string;
    },
  ) {
    return this.customersService.recordLedgerEntry(id, body);
  }

  @Post()
  create(@Body() body: any) {
    return this.customersService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.customersService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
