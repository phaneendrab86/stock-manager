import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FreeGiftsService } from './free-gifts.service';
import type { CreateFreeGiftDto, UpdateFreeGiftDto } from './free-gifts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/rewards/gifts')
@UseGuards(JwtAuthGuard)
export class FreeGiftsController {
  constructor(private freeGiftsService: FreeGiftsService) {}

  @Post()
  create(@Body() createFreeGiftDto: CreateFreeGiftDto) {
    return this.freeGiftsService.create(createFreeGiftDto);
  }

  @Get()
  findAll(@Query('activeOnly') activeOnly = true) {
    return this.freeGiftsService.findAll(activeOnly);
  }

  @Get('available/:maxValue')
  getAvailable(@Param('maxValue') maxValue: string) {
    return this.freeGiftsService.getAvailableGifts(parseFloat(maxValue));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.freeGiftsService.findOne(id);
  }

  @Get(':id/stock')
  getStock(@Param('id') id: string) {
    return this.freeGiftsService.getStockLevel(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateFreeGiftDto: UpdateFreeGiftDto,
  ) {
    return this.freeGiftsService.update(id, updateFreeGiftDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.freeGiftsService.remove(id);
  }
}
