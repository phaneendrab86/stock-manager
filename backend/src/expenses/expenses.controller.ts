import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Delete, Put } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
    
@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    @Get()
    findAll() {
        return this.expensesService.findAll();
    }

    @Get('categories')
    findCategories() {
        return this.expensesService.findCategories();
    }

    @Post('categories')
    createCategory(@Body() createCategoryDto: CreateExpenseCategoryDto, @Request() req) {
        return this.expensesService.createCategory(createCategoryDto, req.user.userId);
    }

    @Put('categories/:id')
    updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateExpenseCategoryDto, @Request() req) {
        return this.expensesService.updateCategory(id, updateCategoryDto, req.user.userId);
    }
    @Delete('categories/:id')
    deleteCategory(@Param('id') id: string, @Request() req) {
        return this.expensesService.deleteCategory(id, req.user.userId);
    }

    @Post()
    create(@Body() data: CreateExpenseDto, @Request() req) {
        return this.expensesService.create(data, req.user.userId);
    }

    @Patch(':id/approve')
    approve(@Param('id') id: string, @Request() req, @Body('note') note: string) {
        return this.expensesService.approve(id, req.user.userId, note);
    }

    @Patch(':id/reject')
    reject(@Param('id') id: string, @Request() req, @Body('note') note: string) {
        return this.expensesService.reject(id, req.user.userId, note);
    }
}
