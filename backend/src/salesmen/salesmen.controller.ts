import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { SalesmenService } from './salesmen.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('salesmen')
export class SalesmenController {
    constructor(private readonly salesmenService: SalesmenService) { }

    @Get()
    findAll(@Query('distributorId') distributorId?: string) {
        if (distributorId) {
            return this.salesmenService.findByDistributor(distributorId);
        }
        return this.salesmenService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.salesmenService.findOne(id);
    }

    @Post()
    create(@Body() body: any, @Request() req: any) {
        return this.salesmenService.create(body, req.user.userId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        return this.salesmenService.update(id, body, req.user.userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req: any) {
        return this.salesmenService.remove(id, req.user.userId);
    }
}
