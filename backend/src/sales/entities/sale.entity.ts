import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { SaleItem } from './sale-item.entity';
import { Credit } from '../../credits/entities/credit.entity';
import { PaymentMethod } from '../enums/payment-method.enum';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  sale_key: string;

  @Column({ type: 'int', comment: 'Total in centavos (MXN)' })
  total: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  payment_method: PaymentMethod;

  // Many sales are registered by one cashier/admin.
  @ManyToOne(() => User, (user) => user.sales, { nullable: false })
  @JoinColumn({ name: 'user_key' })
  user: User;

  @Column({ type: 'uuid' })
  user_key: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => SaleItem, (saleItem) => saleItem.sale)
  saleItems: SaleItem[];

  // A CREDIT sale produces a credit ledger entry.
  @OneToMany(() => Credit, (credit) => credit.sale)
  credits: Credit[];
}
