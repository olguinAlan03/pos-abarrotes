import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';

//@UseGuards(JwtAuthGuard)
@Controller()
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get('categories')
  getCategories() {
    return this.productsService.findAllCategories();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.productsService.createCategory(dto);
  }

  @Get('products')
  getProducts(
    @Query('search') search?: string,
    @Query('categoryKey') categoryKey?: string,
  ) {
    return this.productsService.findAll(search, categoryKey);
  }

  @Get('products/barcode/:code')
  getByBarcode(@Param('code') code: string) {
    return this.productsService.findByBarcode(code);
  }

  @Get('products/:key')
  getProduct(@Param('key') key: string) {
    return this.productsService.findOne(key);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('products/:key')
  updateProduct(@Param('key') key: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(key, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('products/:key')
  removeProduct(@Param('key') key: string) {
    return this.productsService.remove(key);
  }
}
