# Vincent's Business Automation System

A SvelteKit application for managing grocery and hardware shop operations, including sales, inventory, payroll, and credit management.

## Tech Stack

- **Frontend:** SvelteKit 2.x with Svelte 5
- **Database:** SQLite with Drizzle ORM
- **Styling:** Tailwind CSS 4.x
- **Icons:** Material Symbols

## Prerequisites

- Node.js (v18 or higher)
- npm (or pnpm/yarn)

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables (Optional)

The application uses a SQLite database. By default, it will use `file:local.db` if no environment variable is set.

**Option A: Use Default (Recommended for Development)**

Skip this step. The application will automatically use `file:local.db`.

**Option B: Custom Configuration**

If you want to use a different database location, create a `.env` file:

```bash
cp .env.example .env
```

Then edit `.env` to customize the database location:

```bash
DATABASE_URL=file:local.db
```

**Note:** The `.env` file is in `.gitignore` and will not be committed to version control.

### 3. Generate Database Migrations

Drizzle will generate migration files based on your schema:

```bash
npm run db:generate
```

This creates migration SQL files in the `drizzle` directory.

### 4. Run Database Migrations

Apply the migrations to create your database tables:

```bash
npm run db:migrate
```

### 5. Seed the Database

Populate the database with default data (60 products, 17 employees, 6 credit clients):

```bash
npm run db:reset
```

**Note:** This command will drop all existing data and reseed the database. Use with caution in production.

## Running the Application

### Development Server

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

To automatically open the browser:

```bash
npm run dev -- --open
```

### Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Database Management

### Reset Database

Drop all tables and reseed with fresh data:

```bash
npm run db:reset
```

### Access Database Studio

Open Drizzle Studio to browse and edit your database:

```bash
npm drizzle-kit studio
```

## Project Structure

```
src/
├── lib/
│   ├── components/     # Svelte components
│   │   ├── dashboard/
│   │   ├── sales/
│   │   ├── inventory/
│   │   ├── payroll/
│   │   └── credits/
│   └── server/
│       └── db/         # Database schema and utilities
│           ├── schema.js
│           ├── seed.js
│           └── index.js
├── routes/             # SvelteKit routes
│   ├── +page.svelte   # Dashboard
│   ├── sales/
│   ├── inventory/
│   ├── payroll/
│   └── credits/
└── app.html

scripts/
└── reset-db.js         # Database reset script
```

## Features

- **Dashboard:** Overview of key metrics and recent activity
- **Sales Management:** Record cash and credit sales for both shops
- **Inventory Control:** Track stock levels, adjust quantities, set thresholds
- **Payroll System:** Manage full-time and runner employee payments
- **Credit Management:** Track B2B client accounts and transactions

## Seeded Data

The database reset includes:

- **30 Grocery Items:** Maize meal, rice, cooking oil, household goods
- **30 Hardware Items:** Engine oils, filters, brake pads, batteries
- **8 Grocery Employees:** Zimbabwean names with various roles
- **5 Hardware Employees:** South African names with various roles
- **4 Runners:** Delivery and helper staff
- **6 Credit Clients:** Sample garage businesses with transactions

## Troubleshooting

### Database locked error

If you encounter a "database is locked" error, ensure no other processes are accessing the database file.

### DATABASE_URL not set

If you see an error about DATABASE_URL, don't worry. The application will automatically use `file:local.db` as the default. You don't need to create a `.env` file unless you want to use a custom database location.

### Module not found errors

Make sure all imports include the `.js` extension for ES modules.

### Build errors

Clear the build cache and reinstall dependencies:

```bash
rm -rf .svelte-kit node_modules
npm install
npm run build
```

## License

MIT
