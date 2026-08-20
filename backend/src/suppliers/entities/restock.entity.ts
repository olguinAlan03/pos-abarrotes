import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Supplier } from './supplier.entity';

// Bridge entity: every inventory replenishment event links exactly one
// product to the supplier that provided it.
@Entity('restocks')
export class Restock {
  @PrimaryGeneratedColumn('uuid')
  restock_key: string;

  // Many restocks can replenish the same product over time.
  @ManyToOne(() => Product, (product) => product.restocks, { nullable: false })
  @JoinColumn({ name: 'product_key' })
  product: Product;

  @Column({ type: 'uuid' })
  product_key: string;

  // Many restocks can be fulfilled by the same supplier.
  @ManyToOne(() => Supplier, (supplier) => supplier.restocks, { nullable: false })
  @JoinColumn({ name: 'supplier_key' })
  supplier: Supplier;

  @Column({ type: 'uuid' })
  supplier_key: string;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantity: number;

  @Column({ type: 'int', comment: 'Unit cost in centavos (MXN)' })
  unit_cost: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
