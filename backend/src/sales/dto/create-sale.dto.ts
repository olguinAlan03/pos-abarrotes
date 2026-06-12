import {
  IsEnum,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsInt,
  IsPositive,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../enums/payment-method.enum';

export class SaleItemDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsNumber()
  @Min(0.001)
  quantity: number;
}

export class CreateSaleDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
