import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';
import { Customer } from './customer.entity';
import { CreditPayment } from './credit-payment.entity';

export enum CreditStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
}

@Entity('credits')
export class Credit {
  @PrimaryGeneratedColumn('uuid')
  credit_key: string;

  // Each credit entry traces back to the sale that generated it.
  @ManyToOne(() => Sale, (sale) => sale.credits, { nullable: false })
  @JoinColumn({ name: 'sale_key' })
  sale: Sale;

  @Column({ type: 'uuid' })
  sale_key: string;

  // Each credit entry belongs to exactly one customer's tab.
  @ManyToOne(() => Customer, (customer) => customer.credits, { nullable: false })
  @JoinColumn({ name: 'customer_key' })
  customer: Customer;

  @Column({ type: 'uuid' })
  customer_key: string;

  @Column({ type: 'int', comment: 'Amount due in centavos (MXN)' })
  amount_due: number;

  @Column({ type: 'int', default: 0, comment: 'Amount paid in centavos (MXN)' })
  amount_paid: number;

  @Column({ type: 'date' })
  due_date: Date;

  @Column({ type: 'enum', enum: CreditStatus, default: CreditStatus.PENDING })
  status: CreditStatus;

  // One credit (tab) can be settled through several partial payments.
  @OneToMany(() => CreditPayment, (payment) => payment.credit)
  payments: CreditPayment[];
}
