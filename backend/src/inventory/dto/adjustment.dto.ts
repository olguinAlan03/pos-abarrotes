import { IsInt, IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class AdjustmentDto {
  @IsInt()
  productId: number;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
