import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { UnitsModule } from './units/units.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ExpensesModule } from './expenses/expenses.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SystemConfigModule } from './system-config/system-config.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RemindersModule } from './reminders/reminders.module';
import { SchedulerSettingsModule } from './scheduler/scheduler.module';
import { ReportsModule } from './reports/reports.module';
import { SalesmenModule } from './salesmen/salesmen.module';
import { VisitsModule } from './visits/visits.module';
import { DistributorsModule } from './distributors/distributors.module';
import { PurchasesModule } from './purchases/purchases.module';
import { CouponsModule } from './coupons/coupons.module';
import { CustomersModule } from './customers/customers.module';
import { RewardSettingsModule } from './reward-settings/reward-settings.module';
import { GiftSlabsModule } from './gift-slabs/gift-slabs.module';
import { FreeGiftsModule } from './free-gifts/free-gifts.module';
import { GiftAllocationModule } from './gift-allocation/gift-allocation.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    UnitsModule,
    AnalyticsModule,
    ExpensesModule,
    InvoicesModule,
    SystemConfigModule,
    AuditLogModule,
    NotificationsModule,
    RemindersModule,
    SchedulerSettingsModule,
    ReportsModule,
    SalesmenModule,
    VisitsModule,
    DistributorsModule,
    PurchasesModule,
    CouponsModule,
    CustomersModule,
    RewardSettingsModule,
    GiftSlabsModule,
    FreeGiftsModule,
    GiftAllocationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
