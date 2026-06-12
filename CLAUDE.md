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
- **Infrastructure**: Docker Compose

## Monorepo Structure
```
pos-abarrotes/
├── backend/          NestJS API
│   └── src/
│       ├── auth/
│       ├── products/
│       ├── inventory/
│       ├── sales/
│       ├── common/   guards, decorators, filters
│       └── database/ seeds, migrations
├── frontend/         React + Vite
│   └── src/
│       ├── api/      axios API clients
│       ├── components/
│       ├── pages/
│       ├── store/    Zustand stores
│       ├── types/
│       └── lib/      utils, currency formatter
├── .plans/           development plan
└── docker-compose.yml
```

## Commands

### Infrastructure
```bash
docker-compose up -d          # start PostgreSQL + pgAdmin
docker-compose down           # stop
```

### Backend
```bash
cd backend
npm run start:dev             # dev server (port 3000)
npm run build                 # compile
npm run seed                  # seed admin user + sample data
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
- TypeORM 1.0.0 uses object-style relations: `relations: { category: true }` (NOT array strings)
- shadcn/ui components live in `frontend/src/components/ui/`
- After `npx shadcn add`, move components from `frontend/@/` to `frontend/src/` (shadcn alias resolution bug)

## Roles
- `admin`: full access — products CRUD, inventory adjustments, credit client creation, cash register close
- `cashier`: POS screen, sales history, view inventory

## Business Rules (Phase 1)
- Inventory decrements atomically within the sale transaction (if stock insufficient, sale fails)
- Barcode scanner acts as USB keyboard; barcode input auto-focuses and re-focuses after each scan
- Default admin credentials (dev seed): `admin` / `admin123`

## Modules (Phase 1 complete)
- `auth` — login, JWT, roles guard
- `products` — CRUD, barcode lookup, categories
- `inventory` — stock levels, movements, low-stock query
- `sales` — POS sale creation with atomic stock decrement

## Modules (Phase 2+)
- `suppliers` — purchase registration (increases stock)
- `credits` — client tabs, installments
- `containers` — loan/return tracking
- `cash-register` — daily close formula
