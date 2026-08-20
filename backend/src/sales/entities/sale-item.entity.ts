import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('sale_items')
export class SaleItem {
  @PrimaryGeneratedColumn('uuid')
  sale_items_key: string;

  // Many line items belong to one sale.
  @ManyToOne(() => Sale, (sale) => sale.saleItems, { nullable: false })
  @JoinColumn({ name: 'sale_key' })
  sale: Sale;

  @Column({ type: 'uuid' })
  sale_key: string;

  // Many line items can reference the same product.
  @ManyToOne(() => Product, (product) => product.saleItems, { nullable: false })
  @JoinColumn({ name: 'product_key' })
  product: Product;

  @Column({ type: 'uuid' })
  product_key: string;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantity: number;

  @Column({ type: 'int', comment: 'Subtotal in centavos (MXN)' })
  subtotal: number;
}
