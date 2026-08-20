import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale) private salesRepo: Repository<Sale>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateSaleDto, userKey: string): Promise<Sale> {
    const saleKey = await this.dataSource.transaction(async (manager) => {
      const productsRepo = manager.getRepository(Product);
      let total = 0;
      const itemsToSave: Partial<SaleItem>[] = [];

      for (const itemDto of dto.items) {
        const product = await productsRepo.findOne({
          where: { product_key: itemDto.productKey },
        });
        if (!product) {
          throw new NotFoundException(`Product ${itemDto.productKey} not found`);
        }
        if (product.stock < itemDto.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}". Available: ${product.stock}`,
          );
        }

        const subtotal = Math.round(product.price * itemDto.quantity);
        total += subtotal;

        itemsToSave.push({
          product_key: product.product_key,
          quantity: itemDto.quantity,
          subtotal,
        });

        // Stock decrement happens atomically within this same transaction —
        // if any later item fails (e.g. insufficient stock), everything
        // before it rolls back too.
        product.stock -= itemDto.quantity;
        await productsRepo.save(product);
      }

      const sale = await manager.getRepository(Sale).save(
        manager.getRepository(Sale).create({
          user_key: userKey,
          payment_method: dto.paymentMethod,
          total,
        }),
      );

      const saleItems = itemsToSave.map((item) =>
        manager.getRepository(SaleItem).create({ ...item, sale_key: sale.sale_key }),
      );
      await manager.getRepository(SaleItem).save(saleItems);

      return sale.sale_key;
    });

    return this.findOne(saleKey);
  }

  findAll(page = 1, limit = 20) {
    return this.salesRepo.find({
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: { user: true },
    });
  }

  async findOne(saleKey: string) {
    const sale = await this.salesRepo.findOne({
      where: { sale_key: saleKey },
      relations: { saleItems: { product: true }, user: true },
    });
    if (!sale) throw new NotFoundException(`Sale ${saleKey} not found`);
    return sale;
  }
}
