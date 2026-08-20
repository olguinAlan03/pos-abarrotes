import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('cash_register_cuts')
export class CashRegisterCut {
  @PrimaryGeneratedColumn('uuid')
  cut_key: string;

  @Column({ type: 'int', comment: 'Opening cash balance in centavos (MXN)' })
  opening_balance: number;

  @Column({ type: 'int', comment: 'Total cash sales in centavos (MXN)' })
  total_sales: number;

  @Column({ type: 'int', comment: 'Total supplier expenses in centavos (MXN)' })
  total_supplier_expenses: number;

  @Column({ type: 'int', comment: 'Total credit installments collected in centavos (MXN)' })
  total_credit_collected: number;

  @Column({ type: 'int', comment: 'Expected closing balance in centavos (MXN)' })
  closing_balance: number;

  // The admin who performed this daily cash register close.
  @ManyToOne(() => User, (user) => user.cashRegisterCuts, { nullable: false })
  @JoinColumn({ name: 'cut_by' })
  cutBy: User;

  @Column({ type: 'uuid' })
  cut_by: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
