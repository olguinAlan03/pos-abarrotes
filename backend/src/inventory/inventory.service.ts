import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { InventoryMovement, MovementType } from './entities/inventory-movement.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Stock) private stockRepo: Repository<Stock>,
    @InjectRepository(InventoryMovement) private movementsRepo: Repository<InventoryMovement>,
  ) {}

  findAll() {
    return this.stockRepo.find({
      relations: { product: { category: true } },
      order: { product: { name: 'ASC' } } as any,
    });
  }

  async findByProduct(productId: number) {
    const stock = await this.stockRepo.findOne({
      where: { productId },
      relations: { product: true },
    });
    if (!stock) throw new NotFoundException(`Stock for product #${productId} not found`);

    const movements = await this.movementsRepo.find({
      where: { productId },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return { stock, movements };
  }

  findLowStock() {
    return this.stockRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.product', 'p')
      .leftJoinAndSelect('p.category', 'c')
      .where('s.quantity <= s.lowStockThreshold')
      .getMany();
  }

  async manualAdjustment(
    productId: number,
    quantity: number,
    reason: string,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(Stock) : this.stockRepo;
    const mvRepo = manager
      ? manager.getRepository(InventoryMovement)
      : this.movementsRepo;

    const stock = await repo.findOne({ where: { productId } });
    if (!stock) throw new NotFoundException(`Stock not found for product #${productId}`);

    const before = Number(stock.quantity);
    stock.quantity = before + quantity;
    if (Number(stock.quantity) < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    await repo.save(stock);

    await mvRepo.save(
      mvRepo.create({
        productId,
        type: MovementType.ADJUSTMENT,
        quantity,
        quantityBefore: before,
        quantityAfter: Number(stock.quantity),
        reason,
      }),
    );

    return stock;
  }

  async decrementStock(
    productId: number,
    quantity: number,
    referenceId: string,
    manager: EntityManager,
  ) {
    const stock = await manager.getRepository(Stock).findOne({ where: { productId } });
    if (!stock) throw new NotFoundException(`Stock not found for product #${productId}`);

    const before = Number(stock.quantity);
    const after = before - quantity;
    if (after < 0) {
      throw new BadRequestException(
        `Insufficient stock for product #${productId}. Available: ${before}`,
      );
    }

    stock.quantity = after;
    await manager.getRepository(Stock).save(stock);

    await manager.getRepository(InventoryMovement).save(
      manager.getRepository(InventoryMovement).create({
        productId,
        type: MovementType.SALE,
        quantity: -quantity,
        quantityBefore: before,
        quantityAfter: after,
        referenceId,
      }),
    );
  }

  async ensureStockExists(productId: number, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Stock) : this.stockRepo;
    const existing = await repo.findOne({ where: { productId } });
    if (!existing) {
      await repo.save(repo.create({ productId, quantity: 0 }));
    }
  }
}
