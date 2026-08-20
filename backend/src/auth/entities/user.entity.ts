  import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';
import { CreditPayment } from '../../credits/entities/credit-payment.entity';
import { CashRegisterCut } from '../../cash-register/entities/cash-register-cut.entity';
import { UserRole } from '../enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_key: string;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CASHIER })
  role: UserRole;

  // One cashier/admin can register many sales.
  @OneToMany(() => Sale, (sale) => sale.user)
  sales: Sale[];

  // One cashier/admin can register many credit payments.
  @OneToMany(() => CreditPayment, (payment) => payment.registeredBy)
  creditPayments: CreditPayment[];

  // One admin can perform many daily cash register cuts.
  @OneToMany(() => CashRegisterCut, (cut) => cut.cutBy)
  cashRegisterCuts: CashRegisterCut[];
}
