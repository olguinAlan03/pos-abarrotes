import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Category } from '../products/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Restock } from '../suppliers/entities/restock.entity';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { Customer } from '../credits/entities/customer.entity';
import { Credit } from '../credits/entities/credit.entity';
import { CreditPayment } from '../credits/entities/credit-payment.entity';
import { BottleReturn } from '../containers/entities/bottle-return.entity';
import { CashRegisterCut } from '../cash-register/entities/cash-register-cut.entity';

// Standalone TypeORM DataSource for scripts that run outside the Nest
// application context (seeding, migrations). The running Nest app uses its
// own connection configured via TypeOrmModule.forRootAsync in app.module.ts.
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT ?? '5433', 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [
    User,
    Category,
    Product,
    Supplier,
    Restock,
    Sale,
    SaleItem,
    Customer,
    Credit,
    CreditPayment,
    BottleReturn,
    CashRegisterCut,
  ],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
