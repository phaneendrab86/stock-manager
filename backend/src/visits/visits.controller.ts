import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('visits')
export class VisitsController {
    constructor(private readonly visitsService: VisitsService) { }

    @Get()
    findAll() {
        return this.visitsService.findAll();
    }

    @Get('follow-ups')
    findFollowUps() {
        return this.visitsService.findFollowUps();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.visitsService.findOne(id);
    }

    @Post()
    create(@Body() body: any, @Request() req: any) {
        return this.visitsService.create(body, req.user.userId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        return this.visitsService.update(id, body, req.user.userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req: any) {
        return this.visitsService.remove(id, req.user.userId);
    }
}
