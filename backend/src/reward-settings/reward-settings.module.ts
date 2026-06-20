import { Module } from '@nestjs/common';
import { RewardSettingsService } from './reward-settings.service';
import { RewardSettingsController } from './reward-settings.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RewardSettingsService],
  controllers: [RewardSettingsController],
  exports: [RewardSettingsService],
})
export class RewardSettingsModule {}
