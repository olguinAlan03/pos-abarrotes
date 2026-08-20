import { IsString, IsInt, Min, IsPositive, IsUUID } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  barcode: string;

  @IsInt()
  @IsPositive()
  price: number;

  @IsInt()
  @Min(0)
  cost: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsUUID()
  categoryKey: string;
}
