import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('distributorId') distributorId?: string) {
    return this.productsService.findAll(distributorId);
  }

  @Get('transactions')
  findAllTransactions() {
    return this.productsService.findAllTransactions();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() body: any, @Request() req: AuthenticatedRequest) {
    return this.productsService.create(body, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.productsService.update(id, body, req.user.userId);
  }

  @Patch(':id/adjust-stock')
  adjustStock(
    @Param('id') id: string,
    @Body()
    body: { quantity: number; unitId: string; type: string; note?: string },
    @Request() req: AuthenticatedRequest,
  ) {
    return this.productsService.adjustStock(
      id,
      body.quantity,
      body.unitId,
      body.type,
      req.user.userId,
      body.note,
    );
  }

  @Get(':id/purchases')
  getPurchases(@Param('id') id: string) {
    return this.productsService.getProductPurchases(id);
  }
}
