import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Credit } from './credit.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('credit_payments')
export class CreditPayment {
  @PrimaryGeneratedColumn('uuid')
  payment_key: string;

  // Many payments can be applied against the same credit (installments).
  @ManyToOne(() => Credit, (credit) => credit.payments, { nullable: false })
  @JoinColumn({ name: 'credit_key' })
  credit: Credit;

  @Column({ type: 'uuid' })
  credit_key: string;

  @Column({ type: 'int', comment: 'Amount paid in centavos (MXN)' })
  amount: number;

  // The cashier/admin who registered this payment.
  @ManyToOne(() => User, (user) => user.creditPayments, { nullable: false })
  @JoinColumn({ name: 'registered_by' })
  registeredBy: User;

  @Column({ type: 'uuid' })
  registered_by: string;

  @CreateDateColumn({ type: 'timestamp' })
  paid_at: Date;
}
