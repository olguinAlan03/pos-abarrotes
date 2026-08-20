import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  category_key: string;

  @Column({ type: 'varchar', unique: true })
  name: string;

  // One category groups many products.
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
