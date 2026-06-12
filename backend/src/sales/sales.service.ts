import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale, SaleStatus } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { InventoryService } from '../inventory/inventory.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale) private salesRepo: Repository<Sale>,
    private dataSource: DataSource,
    private inventoryService: InventoryService,
    private productsService: ProductsService,
  ) {}

  async create(dto: CreateSaleDto, cashierId: string): Promise<Sale> {
    return this.dataSource.transaction(async (manager) => {
      let total = 0;
      const itemsToSave: Partial<SaleItem>[] = [];

      for (const itemDto of dto.items) {
        const product = await this.productsService.findOne(itemDto.productId);
        const subtotal = Math.round(product.price * itemDto.quantity);
        total += subtotal;

        itemsToSave.push({
          productId: product.id,
          quantity: itemDto.quantity,
          unitPrice: product.price,
          subtotal,
        });

        await this.inventoryService.decrementStock(
          product.id,
          itemDto.quantity,
          'pending',
          manager,
        );
      }

      const sale = manager.getRepository(Sale).create({
        cashierId,
        paymentMethod: dto.paymentMethod,
        total,
        items: itemsToSave as SaleItem[],
      });

      const saved = await manager.getRepository(Sale).save(sale);
      return saved;
    });
  }

  findAll(page = 1, limit = 20) {
    return this.salesRepo.find({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: { cashier: true },
    });
  }

  async findOne(id: string) {
    const sale = await this.salesRepo.findOne({
      where: { id },
      relations: { items: { product: true }, cashier: true },
    });
    if (!sale) throw new NotFoundException(`Sale #${id} not found`);
    return sale;
  }

  async void(id: string, cashierId: string) {
    const sale = await this.findOne(id);
    if (sale.status === SaleStatus.VOIDED) {
      throw new NotFoundException('Sale is already voided');
    }

    return this.dataSource.transaction(async (manager) => {
      sale.status = SaleStatus.VOIDED;
      await manager.getRepository(Sale).save(sale);

      for (const item of sale.items) {
        await this.inventoryService.manualAdjustment(
          item.productId,
          Number(item.quantity),
          `Reversal for voided sale ${id}`,
          manager,
        );
      }

      return { message: 'Sale voided successfully' };
    });
  }
}
