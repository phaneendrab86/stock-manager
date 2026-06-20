import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    findAll() {
        return this.categoriesService.findAll();
    }

    @Post()
    create(@Body() body: { name: string }, @Request() req: any) {
        return this.categoriesService.create(body, req.user.userId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: { name: string }, @Request() req: any) {
        return this.categoriesService.update(id, body, req.user.userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req: any) {
        return this.categoriesService.remove(id, req.user.userId);
    }
}
