import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto, @Req() req) {
    return this.expensesService.create(createExpenseDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.expensesService.findAll();
  }

  @Get('categories')
  findAllCategories() {
    return this.expensesService.findAllCategories();
  }

  @Post('categories')
  createCategory(@Body() createExpenseCategoryDto: CreateExpenseCategoryDto) {
    return this.expensesService.createCategory(createExpenseCategoryDto);
  }

  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.expensesService.removeCategory(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Req() req) {
    return this.expensesService.updateStatus(id, 'APPROVED', req.user.userId);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Req() req) {
    return this.expensesService.updateStatus(id, 'REJECTED', req.user.userId);
  }
}