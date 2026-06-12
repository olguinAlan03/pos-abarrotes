import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdjustmentDto } from './dto/adjustment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  getAll() {
    return this.inventoryService.findAll();
  }

  @Get('low-stock')
  getLowStock() {
    return this.inventoryService.findLowStock();
  }

  @Get(':productId')
  getByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.inventoryService.findByProduct(productId);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('adjustment')
  adjust(@Body() dto: AdjustmentDto) {
    return this.inventoryService.manualAdjustment(dto.productId, dto.quantity, dto.reason);
  }
}
