import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Credit } from './credit.entity';
import { BottleReturn } from '../../containers/entities/bottle-return.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  customer_key: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  last_name: string;

  @Column({ type: 'int', default: 0, comment: 'Credit limit in centavos (MXN)' })
  credit_limit: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // One customer can accumulate many credit (tab) entries.
  @OneToMany(() => Credit, (credit) => credit.customer)
  credits: Credit[];

  // One customer can have many open/closed container loans.
  @OneToMany(() => BottleReturn, (bottleReturn) => bottleReturn.customer)
  bottleReturns: BottleReturn[];
}
