import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { RemindersModule } from '../reminders/reminders.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [RemindersModule, NotificationsModule],
  providers: [SchedulerService],
})
export class SchedulerSettingsModule {}
