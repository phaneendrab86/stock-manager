import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Get()
    findAll() {
        return this.invoicesService.findAll();
    }

    @Post()
    create(@Body() body: any) {
        return this.invoicesService.create(body);
    }
}
