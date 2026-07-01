import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import {
  RewardSettingsService,
  RewardSettingsDto,
} from './reward-settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/rewards')
@UseGuards(JwtAuthGuard)
export class RewardSettingsController {
  constructor(private rewardSettingsService: RewardSettingsService) {}

  @Get('settings')
  async getSettings() {
    return this.rewardSettingsService.getSettings();
  }

  @Put('settings')
  async updateSettings(@Body() data: Partial<RewardSettingsDto>) {
    return this.rewardSettingsService.updateSettings(data);
  }
}
