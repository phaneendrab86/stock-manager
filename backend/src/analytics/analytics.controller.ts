import { Controller, Get, UseGuards, Query, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('recent/:type')
  getRecentActivities(@Param('type') type: string) {
    return this.analyticsService.getRecentActivities(type);
  }

  @Get('stock')
  getStockAnalytics(@Query() filters: any) {
    return this.analyticsService.getStockAnalytics(filters);
  }

  @Get('revenue')
  getRevenueAnalytics(@Query() filters: any) {
    return this.analyticsService.getRevenueAnalytics(filters);
  }

  @Get('top-selling')
  getTopSellingAnalytics(@Query() filters: any) {
    return this.analyticsService.getTopSellingAnalytics(filters);
  }

  @Get('average-billing')
  getAverageBillingAnalytics(@Query() filters: any) {
    return this.analyticsService.getAverageBillingAnalytics(filters);
  }

  @Get('customer')
  getCustomerAnalytics(@Query() filters: any) {
    return this.analyticsService.getCustomerAnalytics(filters);
  }

  @Get('customer/:id/trend')
  getCustomerTrend(@Param('id') id: string) {
    return this.analyticsService.getCustomerTrend(id);
  }
}
