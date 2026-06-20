import { Controller, Get, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    findAll(@Request() req: any) {
        return this.notificationsService.findAll(req.user.userId);
    }

    @Get('unread-count')
    getUnreadCount(@Request() req: any) {
        return this.notificationsService.getUnreadCount(req.user.userId);
    }

    @Patch(':id/read')
    markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Delete()
    clearAll(@Request() req: any) {
        return this.notificationsService.clearAll(req.user.userId);
    }
}
