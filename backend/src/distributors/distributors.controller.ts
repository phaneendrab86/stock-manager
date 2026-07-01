import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DistributorsService } from './distributors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('distributors')
@UseGuards(JwtAuthGuard)
export class DistributorsController {
  constructor(private readonly distributorsService: DistributorsService) {}

  @Get()
  findAll() {
    return this.distributorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.distributorsService.findOne(id);
  }

  @Post()
  create(@Body() data: any, @Request() req: AuthenticatedRequest) {
    return this.distributorsService.create(data, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.distributorsService.update(id, data, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.distributorsService.remove(id);
  }

  @Get(':id/ledger')
  getLedger(@Param('id') id: string) {
    return this.distributorsService.getLedger(id);
  }

  @Post(':id/ledger')
  recordLedgerEntry(
    @Param('id') id: string,
    @Body()
    body: { amount: number; type: 'DEBIT' | 'CREDIT'; description: string },
  ) {
    return this.distributorsService.recordLedgerEntry(id, body);
  }
}
