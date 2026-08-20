import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { User } from '../../auth/entities/user.entity';
import { UserRole } from '../../auth/enums/user-role.enum';
import { Category } from '../../products/entities/category.entity';
import { Product } from '../../products/entities/product.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { Restock } from '../../suppliers/entities/restock.entity';
import { Sale } from '../../sales/entities/sale.entity';
import { PaymentMethod } from '../../sales/enums/payment-method.enum';
import { SaleItem } from '../../sales/entities/sale-item.entity';
import { Customer } from '../../credits/entities/customer.entity';
import { Credit, CreditStatus } from '../../credits/entities/credit.entity';
import { BottleReturn, BottleReturnStatus } from '../../containers/entities/bottle-return.entity';

async function seed() {
  await AppDataSource.initialize();
  console.log('[seed] Data source initialized.');

  // Everything below runs inside a single transaction: if any insert fails,
  // every previous insert in this run is rolled back and the DB is left
  // exactly as it was before the script started.
  await AppDataSource.transaction(async (manager) => {
    // ─────────────────────────────────────────────────────────────
    // STEP 1 — Independent entities (no foreign keys).
    // These must exist first; their generated UUIDs are captured below
    // and reused as foreign keys for every dependent entity.
    // ─────────────────────────────────────────────────────────────
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    const cashierPasswordHash = await bcrypt.hash('cajero123', 12);

    const [admin, cashier] = await manager.save(User, [
      { username: 'admin', password: adminPasswordHash, role: UserRole.ADMIN },
      { username: 'cajero1', password: cashierPasswordHash, role: UserRole.CASHIER },
    ]);

    const [bebidas, abarrotes] = await manager.save(Category, [
      { name: 'Bebidas' },
      { name: 'Abarrotes' },
    ]);

    const [distribuidora] = await manager.save(Supplier, [
      { name: 'Distribuidora La Central', phone: '5512345678', contact_name: 'Roberto Díaz' },
    ]);

    const [maria] = await manager.save(Customer, [
      { name: 'María', last_name: 'González' },
    ]);

    console.log('[seed] Independent entities created: users, categories, suppliers, customers.');

    // ─────────────────────────────────────────────────────────────
    // STEP 2 — Products (depend on categories' UUIDs captured above).
    // ─────────────────────────────────────────────────────────────
    const [cocaCola, arroz] = await manager.save(Product, [
      {
        barcode: '7501055300051',
        name: 'Coca Cola 600ml',
        price: 1500,
        cost: 1000,
        stock: 48,
        category_key: bebidas.category_key,
      },
      {
        barcode: '7501234567890',
        name: 'Arroz 1kg',
        price: 2500,
        cost: 1800,
        stock: 30,
        category_key: abarrotes.category_key,
      },
    ]);

    console.log('[seed] Products created, linked to categories.');

    // ─────────────────────────────────────────────────────────────
    // STEP 3 — Sales (depend on users' UUIDs captured above).
    // sale1: paid in cash, fully settled — no credit follows.
    // sale2: paid on credit — a Credit row is created for it in step 6.
    // ─────────────────────────────────────────────────────────────
    const [sale1, sale2] = await manager.save(Sale, [
      { total: 5500, payment_method: PaymentMethod.CASH, user_key: cashier.user_key },
      { total: 1500, payment_method: PaymentMethod.CREDIT, user_key: admin.user_key },
    ]);

    console.log('[seed] Sales created, linked to users.');

    // ─────────────────────────────────────────────────────────────
    // STEP 4 — Sale items (depend on sales + products' UUIDs).
    // sale1 = 2x Coca Cola (1500 ea) + 1x Arroz (2500) = 5500 ✓ matches sale1.total
    // sale2 = 1x Coca Cola on credit = 1500 ✓ matches sale2.total
    // ─────────────────────────────────────────────────────────────
    await manager.save(SaleItem, [
      { sale_key: sale1.sale_key, product_key: cocaCola.product_key, quantity: 2, subtotal: 3000 },
      { sale_key: sale1.sale_key, product_key: arroz.product_key, quantity: 1, subtotal: 2500 },
      { sale_key: sale2.sale_key, product_key: cocaCola.product_key, quantity: 1, subtotal: 1500 },
    ]);

    console.log('[seed] Sale items created, linked to sales and products.');

    // ─────────────────────────────────────────────────────────────
    // STEP 5 — Restocks (depend on products + suppliers' UUIDs).
    // ─────────────────────────────────────────────────────────────
    await manager.save(Restock, [
      {
        product_key: arroz.product_key,
        supplier_key: distribuidora.supplier_key,
        quantity: 50,
        unit_cost: 1800,
      },
    ]);

    console.log('[seed] Restock created, linked to product and supplier.');

    // ─────────────────────────────────────────────────────────────
    // STEP 6 — Credits (depend on sales + customers' UUIDs).
    // Only sale2 (CREDIT) produces a credit ledger entry; sale1 (CASH) does not.
    // ─────────────────────────────────────────────────────────────
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    await manager.save(Credit, [
      {
        sale_key: sale2.sale_key,
        customer_key: maria.customer_key,
        amount_due: sale2.total,
        due_date: new Date(Date.now() + THIRTY_DAYS_MS),
        status: CreditStatus.PENDING,
      },
    ]);

    console.log('[seed] Credit created, linked to sale and customer.');

    // ─────────────────────────────────────────────────────────────
    // STEP 7 — Bottle returns (depend on products + customers' UUIDs).
    // María borrowed 2 returnable bottles as part of sale2.
    // ─────────────────────────────────────────────────────────────
    await manager.save(BottleReturn, [
      {
        product_key: cocaCola.product_key,
        customer_key: maria.customer_key,
        quantity: 2,
        status: BottleReturnStatus.LOANED,
        date_issued: new Date(),
        date_returned: null,
      },
    ]);

    console.log('[seed] Bottle return created, linked to product and customer.');
  });

  console.log('[seed] Transaction committed successfully.');
  await AppDataSource.destroy();
  console.log('[seed] Connection closed.');
}

seed().catch((err) => {
  console.error('[seed] Failed — transaction rolled back:', err);
  process.exit(1);
});
