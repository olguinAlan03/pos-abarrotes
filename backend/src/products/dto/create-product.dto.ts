import { IsString, IsInt, Min, IsOptional, IsPositive } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsInt()
  @IsPositive()
  price: number;

  @IsInt()
  @Min(0)
  cost: number;

  @IsInt()
  @IsPositive()
  categoryId: number;
}
