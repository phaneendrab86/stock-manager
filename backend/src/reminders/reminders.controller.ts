import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  create(@Body() data: any, @Request() req: AuthenticatedRequest) {
    return this.remindersService.create(req.user.userId, data);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.remindersService.findAll(req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.remindersService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.remindersService.remove(id);
  }
}
