import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Restock } from './restock.entity';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  supplier_key: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  phone: string;

  @Column({ type: 'varchar' })
  contact_name: string;

  // One supplier can fulfill many restocks over time.
  @OneToMany(() => Restock, (restock) => restock.supplier)
  restocks: Restock[];
}
