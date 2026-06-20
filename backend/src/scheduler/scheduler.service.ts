import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RemindersService } from '../reminders/reminders.service';
import { NotificationsService } from '../notifications/notifications.service';
// import { ReminderFrequency } from '@prisma/client';

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(
        private remindersService: RemindersService,
        private notificationsService: NotificationsService,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        this.logger.debug('Checking for due reminders...');
        const dueReminders = await this.remindersService.findDueReminders();

        for (const reminder of dueReminders) {
            this.logger.log(`Processing reminder: ${reminder.title}`);

            // Create notification
            await this.notificationsService.create(
                reminder.userId,
                `Reminder: ${reminder.title}`,
                reminder.description || 'No description provided.',
            );

            // Calculate next run time
            const nextRun = this.calculateNextRun(reminder.nextRun, reminder.frequency);

            // Update reminder
            await this.remindersService.update(reminder.id, {
                nextRun,
                lastRun: new Date(),
            });
        }
    }

    private calculateNextRun(currentRun: Date, frequency: string): Date {
        const next = new Date(currentRun);
        switch (frequency) {
            case 'DAILY':
                next.setDate(next.getDate() + 1);
                break;
            case 'ALT_DAYS':
                next.setDate(next.getDate() + 2);
                break;
            case 'WEEKLY':
                next.setDate(next.getDate() + 7);
                break;
            case 'MONTHLY':
                next.setMonth(next.getMonth() + 1);
                break;
            case 'YEARLY':
                next.setFullYear(next.getFullYear() + 1);
                break;
            default:
                // For CUSTOM or others, default to next day for safety if not logic provided
                next.setDate(next.getDate() + 1);
        }
        return next;
    }
}
