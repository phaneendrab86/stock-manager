import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll() {
    return this.expensesService.findAll();
  }

  @Get('categories')
  findCategories() {
    return this.expensesService.findCategories();
  }

  @Post()
  create(@Body() data: any, @Request() req: AuthenticatedRequest) {
    return this.expensesService.create(data, req.user.userId);
  }

  @Patch(':id/approve')
  approve(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body('note') note: string,
  ) {
    return this.expensesService.approve(id, req.user.userId, note);
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body('note') note: string,
  ) {
    return this.expensesService.reject(id, req.user.userId, note);
  }
}
