import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('system-config')
@UseGuards(JwtAuthGuard)
export class SystemConfigController {
    constructor(private readonly systemConfigService: SystemConfigService) { }

    @Get()
    getConfig() {
        return this.systemConfigService.getConfig();
    }

    @Patch()
    updateConfig(@Body() data: any) {
        return this.systemConfigService.updateConfig(data);
    }
}
