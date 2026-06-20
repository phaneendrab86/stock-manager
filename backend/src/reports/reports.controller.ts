import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('sales')
    getSalesReport(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.reportsService.getSalesReport(startDate, endDate);
    }

    @Get('inventory')
    getInventoryReport() {
        return this.reportsService.getInventoryReport();
    }

    @Get('expenses')
    getExpenseReport(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.reportsService.getExpenseReport(startDate, endDate);
    }

    @Get('summary')
    getProfitLossSummary(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.reportsService.getProfitLossSummary(startDate, endDate);
    }
}
