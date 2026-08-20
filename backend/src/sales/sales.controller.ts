import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Post()
  create(@Body() dto: CreateSaleDto, @Request() req: any) {
    return this.salesService.create(dto, req.user.user_key);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.salesService.findAll(page ? +page : 1, limit ? +limit : 20);
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.salesService.findOne(key);
  }
}
