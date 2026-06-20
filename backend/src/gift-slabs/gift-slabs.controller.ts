import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { GiftSlabsService } from './gift-slabs.service';
import type { CreateGiftSlabDto, UpdateGiftSlabDto } from './gift-slabs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/rewards/slabs')
@UseGuards(JwtAuthGuard)
export class GiftSlabsController {
  constructor(private giftSlabsService: GiftSlabsService) {}

  @Post()
  create(@Body() createGiftSlabDto: CreateGiftSlabDto) {
    return this.giftSlabsService.create(createGiftSlabDto);
  }

  @Get()
  findAll() {
    return this.giftSlabsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.giftSlabsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateGiftSlabDto: UpdateGiftSlabDto,
  ) {
    return this.giftSlabsService.update(id, updateGiftSlabDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.giftSlabsService.remove(id);
  }
}
