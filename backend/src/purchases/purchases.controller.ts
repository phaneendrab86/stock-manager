import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('purchases')
@UseGuards(JwtAuthGuard)
export class PurchasesController {
    constructor(private readonly purchasesService: PurchasesService) { }

    @Get()
    findAll() {
        return this.purchasesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.purchasesService.findOne(id);
    }

    @Post()
    create(@Body() data: any, @Request() req: any) {
        return this.purchasesService.create(data, req.user.userId);
    }

    @Post(':id/payments')
    addPayment(@Param('id') id: string, @Body() data: any) {
        return this.purchasesService.addPayment(id, data);
    }
}
