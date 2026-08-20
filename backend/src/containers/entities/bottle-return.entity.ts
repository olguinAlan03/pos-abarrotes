import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Customer } from '../../credits/entities/customer.entity';

export enum BottleReturnStatus {
  LOANED = 'LOANED',
  RETURNED = 'RETURNED',
}

@Entity('bottle_returns')
export class BottleReturn {
  @PrimaryGeneratedColumn('uuid')
  bottle_return_key: string;

  // The container/bottle being loaned is tied to a specific product
  // (e.g. "Caguama 940ml").
  @ManyToOne(() => Product, (product) => product.bottleReturns, { nullable: false })
  @JoinColumn({ name: 'product_key' })
  product: Product;

  @Column({ type: 'uuid' })
  product_key: string;

  // The customer currently holding the loaned container.
  @ManyToOne(() => Customer, (customer) => customer.bottleReturns, { nullable: false })
  @JoinColumn({ name: 'customer_key' })
  customer: Customer;

  @Column({ type: 'uuid' })
  customer_key: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'enum', enum: BottleReturnStatus, default: BottleReturnStatus.LOANED })
  status: BottleReturnStatus;

  @Column({ type: 'timestamp' })
  date_issued: Date;

  // Null while the container has not been returned yet.
  @Column({ type: 'timestamp', nullable: true })
  date_returned: Date | null;
}
