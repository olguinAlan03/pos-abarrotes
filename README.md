# POS Abarrotes

Point-of-sale system for a grocery store. Manages sales, inventory, store credit tabs, supplier purchases, container loans, and daily cash register closing.

## Prerequisites
- Node.js 20+
- Docker Desktop
- npm 9+

## Quick Start

### 1. Start the database
```bash
cp .env.example .env
docker-compose up -d
```

### 2. Start the backend
```bash
cd backend
npm install
npm run start:dev
```

### 3. Seed initial data
```bash
# In a second terminal (while backend is running):
cd backend
npm run seed
```

### 4. Start the frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and login with `admin` / `admin123`.

## Services
| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| pgAdmin | http://localhost:5050 |

## Environment Variables
See `.env.example` for all required variables.

## Architecture
See [CLAUDE.md](CLAUDE.md) for full architecture, conventions, and development guide.

## Development Plan
See [.plans/master_plan.md](.plans/master_plan.md) for the phased roadmap.
