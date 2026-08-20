# POS Abarrotes — CLAUDE.md

## Project Purpose
Point-of-sale system for a grocery store. Manages sales, inventory, suppliers, credit tabs (store accounts), container loans, and daily cash register closing. Built for personal business use with enterprise architecture foundations to support future scaling.

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite + shadcn/ui (base-nova) + Tailwind CSS v4
- **State**: Zustand (persisted auth store, ephemeral cart store)
- **Forms**: React Hook Form + Zod
- **Backend**: Node.js + NestJS + TypeScript (Modular Monolith)
- **ORM**: TypeORM 1.0.0
- **Database**: PostgreSQL 16
- **Auth**: JWT (8h) + bcrypt (cost 12)
- **Infrastructure**: Docker Compose (isolated on host port 5433 to avoid clashing with other local Postgres instances)

## Monorepo Structure
```
pos-abarrotes/
├── backend/          NestJS API
│   └── src/
│       ├── auth/         User entity, JWT strategy, login
│       ├── products/     Product, Category entities + CRUD
│       ├── suppliers/    Supplier, Restock entities
│       ├── credits/      Customer, Credit, CreditPayment entities + CreditsService
│       ├── containers/   BottleReturn entity
│       ├── cash-register/ CashRegisterCut entity
│       ├── sales/        Sale, SaleItem entities + atomic checkout
│       ├── common/       guards, decorators, filters
│       └── database/     data-source.ts (standalone DataSource for seeding), seeds/seed.ts
├── frontend/         React + Vite
│   └── src/
│       ├── api/      axios API clients
│       ├── components/
│       ├── pages/
│       ├── store/    Zustand stores
│       ├── types/
│       ├── i18n/     es.ts — all UI strings centralized here (Spanish)
│       └── lib/      utils, currency formatter
├── .plans/           development plan
└── docker-compose.yml
```

## Commands

### Infrastructure
```bash
docker-compose up -d          # start PostgreSQL (host port 5433) + pgAdmin
docker-compose down -v        # stop AND wipe volumes (use if credentials/schema changed)
```

### Backend
```bash
cd backend
npm run start:dev             # dev server (port 3000)
npm run build                 # compile
npm run seed                  # standalone seed script (AppDataSource, not Nest DI)
```

### Frontend
```bash
cd frontend
npm run dev                   # dev server (port 5173)
npm run build                 # production build
npx tsc --noEmit              # type check
```

## Key Conventions
- Money is stored as **centavos (integers)** to avoid float errors. MXN $15.00 = 1500.
- All backend routes are prefixed with `/api`
- JWT is sent as `Authorization: Bearer <token>` header
- **Entity schema convention**: every primary key is a `uuid` named `<entity>_key` (e.g. `product_key`, `sale_key`), not `id`. Foreign key scalar columns follow the same name as the referenced PK (e.g. `category_key` on `Product`). This is intentional and mirrored exactly in frontend `types/index.ts` and API DTOs — do not reintroduce `id`.
- TypeORM 1.0.0 uses object-style relations: `relations: { category: true }` (NOT array strings)
- Any entity property typed as `T | null` **must** declare an explicit `type:` in `@Column()` — TypeORM's reflection cannot represent union types and silently falls back to `Object`, which Postgres rejects at sync time.
- `backend/.env` and the root `.env` are two separate files consumed by two separate processes (NestJS at runtime vs. docker-compose at container init). Any `POSTGRES_*` change must be mirrored in both.
- shadcn/ui components live in `frontend/src/components/ui/`
- After `npx shadcn add`, move components from `frontend/@/` to `frontend/src/` (shadcn alias resolution bug)
- All UI text lives in `frontend/src/i18n/es.ts` — no hardcoded strings in components.

## Roles
- `admin`: full access — products CRUD, credit client creation, cash register close
- `cashier`: POS screen, sales history

## Business Rules (Phase 1)
- Inventory decrements directly on `Product.stock` within the sale's DB transaction (if stock insufficient, sale fails and rolls back)
- Barcode scanner acts as USB keyboard; barcode input auto-focuses and re-focuses after each scan
- Default seed credentials: `admin` / `admin123` and `cajero1` / `cajero123`
- Sales have no void/cancel status — the `Sale` entity intentionally has no `status` field (strict schema). A void/refund feature would need a new entity/field if reintroduced.
- Product deletion is a **hard delete** — `Product` has no soft-delete column.
- **Units are now fully standardized to centavos (int)** across every monetary field: `Credit.amount_due`, `Credit.amount_paid`, `Customer.credit_limit`, `CreditPayment.amount`, all `CashRegisterCut` totals, `Product.price/cost`, `Restock.unit_cost`, `Sale.total`, `SaleItem.subtotal`. The V2 dictionary originally specified `amount_paid`/`credit_limit`/`amount` as `decimal(10,2)`; this was corrected to `int` via migration `1781681161204-StandardizeCreditAmountsToCents` to match the rest of the codebase and to avoid the pg/TypeORM behavior where `decimal` columns deserialize as `string`, not `number` (a real latent bug — `+=` on a string silently does concatenation, not addition).
- Credit due dates are now tracked (`Credit.due_date`) — this supersedes the original "no strict deadline" Phase 1 business rule.
- **Known remaining inconsistency (flagged, not fixed)**: `Product.stock` is `int`, but `Product.min_stock_alert`, `SaleItem.quantity`, and `Restock.quantity` are all `decimal(10,3)` to support fractional/bulk-weight items. A bulk product's `stock` cannot precisely track fractional decrements from partial-kg sales. Needs a decision before Phase 2 inventory work.
- Migrations: `backend/src/database/migrations/` is now the only way schema changes reach the database. `synchronize: false` is hardcoded in `app.module.ts` for every environment — there is no auto-sync path anymore, in dev or otherwise. The `migrations` table is the source of truth for applied migrations; it currently has exactly one row (`StandardizeCreditAmountsToCents`). Run new migrations with `npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts` from `backend/`. `src/database/data-source.ts` must keep its `migrations: [__dirname + '/migrations/*{.ts,.js}']` glob in sync with `app.module.ts`'s — they are two separate DataSource configs (one for the live Nest app, one for standalone CLI/scripts) and both need to know where migration files live.

## Modules (current, all entities live)
- `auth` — `User` (user_key, username, password, role)
- `products` — `Category` (category_key, name), `Product` (product_key, barcode, name, price, cost, stock, min_stock_alert, category_key)
- `suppliers` — `Supplier` (supplier_key, name, phone, contact_name), `Restock` (restock_key, product_key, supplier_key, quantity, unit_cost, created_at)
- `credits` — `Customer` (customer_key, name, last_name, credit_limit, is_active), `Credit` (credit_key, sale_key, customer_key, amount_due, amount_paid, due_date, status), `CreditPayment` (payment_key, credit_key, amount, registered_by, paid_at)
- `containers` — `BottleReturn` (bottle_return_key, product_key, customer_key, quantity, status, date_issued, date_returned)
- `cash-register` — `CashRegisterCut` (cut_key, opening_balance, total_sales, total_supplier_expenses, total_credit_collected, closing_balance, cut_by, created_at)
- `sales` — `Sale` (sale_key, total, payment_method, user_key, created_at), `SaleItem` (sale_items_key, sale_key, product_key, quantity, subtotal)

`auth`, `products`, `sales`, and `credits` (service only, no controller yet) have NestJS wiring. `suppliers`, `containers`, and `cash-register` currently have entities only — no service/controller/module (Phase 2+ work).
