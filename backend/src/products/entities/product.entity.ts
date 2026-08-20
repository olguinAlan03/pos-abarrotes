import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Category } from './category.entity';
import { SaleItem } from '../../sales/entities/sale-item.entity';
import { Restock } from '../../suppliers/entities/restock.entity';
import { BottleReturn } from '../../containers/entities/bottle-return.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  product_key: string;

  @Column({ type: 'varchar', unique: true })
  barcode: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'int', comment: 'Sale price in centavos (MXN)' })
  price: number;

  @Column({ type: 'int', comment: 'Purchase cost in centavos (MXN)' })
  cost: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  min_stock_alert: number;

  // Many products belong to one category.
  @ManyToOne(() => Category, (category) => category.products, { nullable: false })
  @JoinColumn({ name: 'category_key' })
  category: Category;

  @Column({ type: 'uuid' })
  category_key: string;

  @OneToMany(() => SaleItem, (saleItem) => saleItem.product)
  saleItems: SaleItem[];

  @OneToMany(() => Restock, (restock) => restock.product)
  restocks: Restock[];

  @OneToMany(() => BottleReturn, (bottleReturn) => bottleReturn.product)
  bottleReturns: BottleReturn[];
}
