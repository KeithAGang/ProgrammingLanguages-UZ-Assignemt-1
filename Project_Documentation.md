# Vincent's Business Automation System - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [Module Documentation](#module-documentation)
5. [Component Reference](#component-reference)
6. [Server Routes](#server-routes)
7. [Development Guide](#development-guide)

---

## Project Overview

**Purpose:** Automate record management, sales tracking, inventory control, payroll calculation, and credit management for Vincent's two businesses (grocery shop and hardware spare parts shop).

**Current State:** All operations tracked manually. No digital records. Overwhelming demand but no system to scale.

**Solution:** A unified web application to eliminate manual record-keeping across five critical business areas.

**Stack:** JavaScript, SvelteKit 5, Drizzle ORM, @libsql/client, Tailwind CSS 4

---

## Technology Stack

### Core Framework
- **SvelteKit 2.x** - Meta-framework for building full-stack web applications
  - File-based routing: `/src/routes/` = URL structure
  - Server-side logic: `+page.server.js` for database operations
  - Components: `.svelte` files with reactive variables
  - Layouts: Nested layouts for shared UI (navigation bar)

### Database & ORM
- **Drizzle ORM** - Lightweight, type-safe database query builder
  - Works with @libsql/client for local file-based database
  - Defines schema with `sqliteTable()` functions
  - Queries: insert, select, update, delete operations

### Database Driver
- **@libsql/client** - SQLite driver for Node.js
  - Creates local `local.db` file
  - Simple, fast, perfect for small projects

### Styling
- **Tailwind CSS 4.x** - Utility-first CSS framework
  - Apply styles directly in HTML
  - Pre-built classes for responsive design
  - Grid, flexbox, spacing, colors all handled via class names

### Icons
- **Material Symbols** - Icon library via npm package
  - Installed via `material-symbols` package
  - Works offline (no CDN dependency)
  - Imported in `src/app.css`
  - Usage: `<span class="material-symbols-outlined">icon_name</span>`

### Frontend Interactivity
- **Svelte 5 Runes** - Reactive primitives for state management
  - `$state` - Create reactive variables
  - `$derived` - Auto-update when dependencies change
  - `$props` - Component properties

---

## Database Schema

### Location
```
src/lib/server/db/schema.js
```

### Database Setup Files

#### index.js
**Location:** `src/lib/server/db/index.js`

**Purpose:** Main database client for SvelteKit routes

**Features:**
- Uses `$env/dynamic/private` for environment variables
- Creates Drizzle client with schema
- Used by all server routes

#### standalone.js
**Location:** `src/lib/server/db/standalone.js`

**Purpose:** Database client for standalone scripts (outside SvelteKit context)

**Features:**
- Uses `process.env.DATABASE_URL` directly
- No SvelteKit dependencies
- Used by database reset script

**Why needed:** Scripts like `reset-db.js` cannot access SvelteKit's environment system, so they need a standalone database client.

#### seed.js
**Location:** `src/lib/server/db/seed.js`

**Purpose:** Database seeding and reset utilities

**Features:**
- `seedDatabase()` - Populates database with default data (idempotent)
- `dropDatabase()` - Clears all data from all tables
- Contains default data arrays for products, employees, and credit clients
- Dynamic import: tries standalone.js first, falls back to index.js

**Seeded Data:**
- **30 Grocery Items** - Maize meal, rice, cooking oil, bread, etc.
- **30 Hardware Items** - Engine oils, filters, brake pads, batteries, etc.
- **17 Employees** - 8 grocery staff (Zimbabwean names), 5 hardware staff (South African names), 4 runners
- **6 Credit Clients** - Sample B2B garage businesses with transactions

**Important:** Products are correctly categorized:
- Grocery items only appear in grocery shop inventory
- Hardware items only appear in hardware shop inventory

### Tables

#### 1. PRODUCTS TABLE
**Purpose:** Central product registry. Both shops reference this when recording sales.

```javascript
products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  sku: text('sku').unique(),
  category: text('category'), // 'grocery' or 'spare-parts'
  unitPrice: real('unit_price').notNull(),
  createdAt: timestamp
});
```

#### 2. INVENTORY TABLE
**Purpose:** Tracks stock levels per shop. Prevents overselling. Auto-alerts when low.

```javascript
inventory = sqliteTable('inventory', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').references(() => products.id),
  shop: text('shop').notNull(), // 'grocery' or 'hardware'
  quantity: integer('quantity').notNull().default(0),
  minThreshold: integer('min_threshold').default(5),
  lastUpdated: timestamp
});
```

#### 3. SALES TABLE
**Purpose:** Permanent record of every transaction. Replaces manual sales log.

```javascript
sales = sqliteTable('sales', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  shop: text('shop').notNull(),
  productId: integer('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  totalAmount: real('total_amount').notNull(),
  saleDate: timestamp,
  notes: text('notes')
});
```

#### 4. EMPLOYEES TABLE
**Purpose:** Employee registry. 12 grocery + 5 hardware + X runners. Tracks salary bands.

```javascript
employees = sqliteTable('employees', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  employeeType: text('employee_type').notNull(), // 'full-time' or 'runner'
  shop: text('shop'), // 'grocery', 'hardware', or 'both'
  baseSalary: integer('base_salary'), // USD 200-900
  dailyRate: real('daily_rate'),
  qualifications: text('qualifications'),
  startDate: timestamp,
  isActive: integer('is_active').default(1)
});
```

#### 5. PAYROLL TABLE
**Purpose:** Payroll automation. Auto-calculates allowances. Tracks payment status.

```javascript
payroll = sqliteTable('payroll', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  employeeId: integer('employee_id').references(() => employees.id),
  payPeriod: text('pay_period').notNull(), // 'daily' or 'monthly'
  basePay: real('base_pay'),
  transportAllowance: real('transport_allowance').default(0),
  mealAllowance: real('meal_allowance').default(0),
  uniformDeduction: real('uniform_deduction').default(0),
  totalPay: real('total_pay').notNull(),
  payDate: timestamp,
  isPaid: integer('is_paid').default(0)
});
```

#### 6. CREDITS TABLE
**Purpose:** B2B client registry. Garages buying spare parts on credit.

```javascript
credits = sqliteTable('credits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clientName: text('client_name').notNull(),
  clientType: text('client_type').default('garage'),
  totalOwed: real('total_owed').notNull().default(0),
  createdAt: timestamp
});
```

#### 7. CREDIT_TRANSACTIONS TABLE
**Purpose:** Credit ledger. Tracks each transaction. Auto-calculates running balance.

```javascript
creditTransactions = sqliteTable('credit_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  creditId: integer('credit_id').references(() => credits.id),
  type: text('type').notNull(), // 'debit' or 'payment'
  amount: real('amount').notNull(),
  description: text('description'),
  transactionDate: timestamp,
  dueDate: timestamp
});
```

---

## Module Documentation

### Dashboard Module

**Location:** `src/routes/dashboard/`

**What it solves:**
- No consolidated view of business health
- Manual calculation of totals across systems

**Features:**
- Real-time metrics: today's sales, outstanding credit, payroll due, low stock count
- Quick navigation to all modules
- Visual status indicators

**Components:**
- `DashboardCards.svelte` - Displays key metrics in card format
- `NavBar.svelte` - Global navigation component

**Server Logic:**
- `+page.server.js` - Aggregates data from all tables for dashboard metrics

---

### Sales Module

**Location:** `src/routes/sales/`

**What it solves:**
- Manual transaction entry
- No transaction history
- Unreliable data

**Features:**
- Record sales with product selection
- Auto-calculate total amount
- Display today's sales history
- Auto-decrement inventory on sale

**Components:**
- `SalesForm.svelte` - Form to record individual sales
- `SalesHistory.svelte` - Display today's sales in table format

**Server Logic:**
- `+page.server.js` - Handles sale recording and inventory updates

**Flow:**
1. User selects shop (grocery/hardware)
2. Selects product from dropdown
3. Enters quantity
4. System auto-calculates total (qty × unitPrice)
5. On submit: Creates sale record + decrements inventory
6. Shows success message

---

### Inventory Module

**Location:** `src/routes/inventory/`

**What it solves:**
- Manual stock tracking
- No alerts for low stock
- Overselling risk
- Difficulty updating stock levels
- No way to quickly identify problem items

**Features:**
- **Tabbed Interface** - Four organized tabs for different workflows
  - Low Stock Alerts (default landing page)
  - All Inventory (browse and search)
  - Manage Products (add new products)
  - Adjust Stock (bulk stock adjustments)
- **Click-to-Edit** - Click any inventory row to edit quantity and threshold
- **Low Stock Prioritization** - Critical items shown first with badge count
- **Add Stock** - Increase inventory levels with reason tracking
- **Remove Stock** - Decrease inventory levels with validation
- **Delete Inventory** - Remove inventory entries with confirmation
- **Filter by Shop** - View grocery or hardware items separately
- **Search by Product** - Quick product lookup
- **Status Indicators** - Visual alerts for out-of-stock and low stock items

**Components:**
- `InventoryTable.svelte` - Displays all inventory items with filtering and click-to-edit
- `AddProduct.svelte` - Add new products (modal or full-width form)
- `AdjustStock.svelte` - Quick stock adjustment interface
- `EditInventory.svelte` - Modal for editing inventory quantity and threshold

**Server Logic:**
- `+page.server.js` - Loads inventory data with status calculation

**Server Actions:**
- `addProduct` - Creates product and inventory entry for appropriate shop
- `adjustStock` - Add or remove stock quantity with validation
- `updateInventory` - Update quantity and minimum threshold
- `deleteInventory` - Remove inventory entry

**Tab Workflow:**
1. **Low Stock Alerts Tab** (Landing page)
   - Shows only items below minimum threshold
   - Badge indicates count of problem items
   - Empty state with green checkmark when all stock healthy
   - Click any item to quickly update stock

2. **All Inventory Tab**
   - Complete inventory view with search and filter
   - Click any row to edit
   - Delete button for each entry

3. **Manage Products Tab**
   - Full-width form to add new products
   - Automatically creates inventory entry in correct shop
   - Grocery items only go to grocery shop
   - Hardware items only go to hardware shop

4. **Adjust Stock Tab**
   - Select inventory item
   - Choose "Add" or "Remove" operation
   - Enter quantity and optional reason
   - Real-time preview of new stock level

**Status Logic:**
- **Out of Stock:** quantity = 0 (red)
- **Low Stock:** quantity < minThreshold (yellow)
- **OK:** quantity >= minThreshold (green)

---

### Payroll Module

**Location:** `src/routes/payroll/`

**What it solves:**
- Manual payroll math for 17 employees
- Different pay structures (monthly vs daily)
- Allowances and deductions tracking

**Features:**
- Employee registration (full-time or runners)
- Monthly payroll calculator for full-time employees
- Daily payroll calculator for runners
- Auto-calculate allowances and deductions
- List of all active employees

**Components:**
- `EmployeeForm.svelte` - Form to add new employees
- `PayrollCalculator.svelte` - Calculate monthly payroll for full-time staff
- `DailyRunners.svelte` - Calculate daily payroll for runners

**Server Logic:**
- `+page.server.js` - Handles employee creation and payroll calculations

**Payroll Calculation:**
- **Full-time:** baseSalary + transport ($50) + meal ($25) - uniform ($30 if issued)
- **Runners:** (dailyRate × daysWorked) + transport ($50) + meal ($25)

---

### Credits Module

**Location:** `src/routes/credits/`

**What it solves:**
- Manual B2B credit tracking
- Unclear cash flow
- No overdue tracking

**Features:**
- Record credit sales (debits)
- Record payments received
- View client ledger with transaction history
- Auto-calculate running balance
- Overdue status indicators

**Components:**
- `CreditForm.svelte` - Form to record transactions (new sale or payment)
- `CreditLedger.svelte` - Display client details and transaction history

**Server Logic:**
- `+page.server.js` - Handles transaction recording and balance updates

**Urgency Status:**
- **Critical:** >30 days overdue (red)
- **Warning:** >7 days overdue (yellow)
- **Current:** Within payment terms (blue)
- **Paid:** Balance = 0 (green)

---

## Component Reference

### Global Components

#### NavBar.svelte
**Location:** `src/lib/components/dashboard/NavBar.svelte`

**Purpose:** Provides unified navigation across all modules

**Features:**
- Sticky positioning
- Active link highlighting
- Responsive hamburger menu on mobile
- Logo/title linking to dashboard

**Props:** None (uses $page store for active state)

---

#### DashboardCards.svelte
**Location:** `src/lib/components/dashboard/DashboardCards.svelte`

**Purpose:** Displays key business metrics at a glance

**Props:**
- `todaysSales` (number) - Total sales for today in USD
- `outstandingCredit` (number) - Total B2B credit owed
- `payrollDue` (number) - Total unpaid payroll
- `lowStockCount` (number) - Number of products below threshold

**Features:**
- Color-coded cards
- Responsive grid layout
- Icons for visual recognition

---

### Sales Components

#### SalesForm.svelte
**Location:** `src/lib/components/sales/SalesForm.svelte`

**Purpose:** Quick form to record a sale

**Props:**
- `products` (array) - List of all products
- `form` (object) - Form action result (success/error)

**Fields:**
- Shop dropdown (grocery/hardware)
- Product selection with prices
- Quantity input
- Auto-calculated total
- Optional notes

**Validation:**
- Product must be selected
- Quantity must be > 0

---

#### SalesHistory.svelte
**Location:** `src/lib/components/sales/SalesHistory.svelte`

**Purpose:** Display today's sales list

**Props:**
- `sales` (array) - List of today's sales with product names

**Features:**
- Table format with time, shop, product, qty, unit price, total
- Sum of all sales displayed at top
- Formatted timestamps

---

### Inventory Components

#### InventoryTable.svelte
**Location:** `src/lib/components/inventory/InventoryTable.svelte`

**Purpose:** Display current stock levels for both shops

**Props:**
- `inventory` (array) - List of inventory items with status
- `form` (object) - Form action result
- `onProductClick` (function) - Callback when row is clicked

**Features:**
- Search by product name
- Filter by shop (all/grocery/hardware)
- Color-coded status badges
- Clickable rows with hover effect (blue background)
- Delete button with confirmation dialog
- Displays product, SKU, shop, quantity, threshold, status

**Interaction:**
- Click any cell in a row to open edit modal
- Delete button stops event propagation to prevent modal opening

---

#### AddProduct.svelte
**Location:** `src/lib/components/inventory/AddProduct.svelte`

**Purpose:** Add new products to the registry

**Props:**
- `form` (object) - Form action result
- `fullWidth` (boolean, default: false) - Display mode

**Features:**
- **Modal Mode** (fullWidth=false)
  - Button triggers popup modal
  - Compact form layout
- **Full-Width Mode** (fullWidth=true)
  - Inline form display
  - Two-column grid layout
  - Used in "Manage Products" tab
- Fields: name, SKU, category, unit price, min threshold
- Auto-creates inventory entry in appropriate shop only
- SKU uniqueness validation

---

#### AdjustStock.svelte
**Location:** `src/lib/components/inventory/AdjustStock.svelte`

**Purpose:** Quick interface to add or remove stock

**Props:**
- `inventory` (array) - List of inventory items
- `form` (object) - Form action result

**Features:**
- Dropdown to select inventory item
- Toggle buttons for "Add" or "Remove" operation
- Quantity input field
- Optional reason field
- Real-time preview showing new stock level
- Prevents removing more stock than available
- Modal interface with save/cancel buttons

**Flow:**
1. Select inventory item from dropdown
2. Choose "Add" or "Remove"
3. Enter quantity
4. Optionally add reason for audit trail
5. Preview shows: Current → New quantity
6. Save updates inventory

---

#### EditInventory.svelte
**Location:** `src/lib/components/inventory/EditInventory.svelte`

**Purpose:** Modal for editing inventory details

**Props:**
- `inventoryItem` (object) - Selected inventory item
- `form` (object) - Form action result
- `onClose` (function) - Callback to close modal

**Features:**
- Read-only product information section (name, SKU, shop, status)
- Editable quantity field with current value display
- Editable minimum threshold field with current value display
- Form validation (quantity and threshold must be >= 0)
- Success/error message display
- Save changes or cancel buttons

**UI:**
- Full-screen overlay with centered modal
- Sticky header with close button
- Two-column read-only info display
- Form submission updates inventory
- Auto-closes on successful save

---

### Payroll Components

#### EmployeeForm.svelte
**Location:** `src/lib/components/payroll/EmployeeForm.svelte`

**Purpose:** Register new employees

**Props:**
- `form` (object) - Form action result

**Features:**
- Dynamic fields based on employee type
- Full-time: base salary (USD 200-900)
- Runner: daily rate
- Shop selection
- Optional qualifications

---

#### PayrollCalculator.svelte
**Location:** `src/lib/components/payroll/PayrollCalculator.svelte`

**Purpose:** Calculate monthly payroll for full-time employees

**Props:**
- `fullTimeEmployees` (array) - List of full-time employees
- `form` (object) - Form action result

**Features:**
- Select employees for payroll
- Checkbox for uniform deduction per employee
- Auto-calculate: base + transport ($50) + meal ($25) - uniform ($30)
- Grand total display
- Save all payroll records at once

---

#### DailyRunners.svelte
**Location:** `src/lib/components/payroll/DailyRunners.svelte`

**Purpose:** Calculate daily payroll for runners

**Props:**
- `runners` (array) - List of runner employees
- `form` (object) - Form action result

**Features:**
- Input days worked per runner
- Auto-calculate: (dailyRate × days) + transport ($50) + meal ($25)
- Grand total display
- Only saves runners with days > 0

---

### Credits Components

#### CreditForm.svelte
**Location:** `src/lib/components/credits/CreditForm.svelte`

**Purpose:** Record credit transactions (sales or payments)

**Props:**
- `clients` (array) - List of existing clients
- `form` (object) - Form action result

**Features:**
- Select existing client or create new
- Transaction type: debit (sale) or payment
- Amount input
- Optional description
- Due date (auto-set to 7 days for debits)

---

#### CreditLedger.svelte
**Location:** `src/lib/components/credits/CreditLedger.svelte`

**Purpose:** Display client credit details and transaction history

**Props:**
- `clients` (array) - List of all clients with balances
- `transactions` (array) - All credit transactions

**Features:**
- Client selection dropdown
- Balance display with urgency status
- Transaction history table (date, type, amount, description, due date)
- Color-coded status indicators
- Calculates days overdue

---

## Server Routes

### Dashboard Server
**File:** `src/routes/dashboard/+page.server.js`

**Load Function:**
- Calculates today's sales total
- Sums outstanding credit
- Calculates unpaid payroll
- Counts low stock items

**Returns:** Object with todaysSales, outstandingCredit, payrollDue, lowStockCount

---

### Sales Server
**File:** `src/routes/sales/+page.server.js`

**Load Function:**
- Fetches all products
- Fetches today's sales with product names

**Actions:**
- `recordSale` - Validates input, creates sale record, decrements inventory

**Validation:**
- Shop, productId, quantity required
- Quantity must be >= 1
- Product must exist

---

### Inventory Server
**File:** `src/routes/inventory/+page.server.js`

**Load Function:**
- Fetches all inventory with product info (joins products and inventory tables)
- Calculates status for each item (out-of-stock/low/ok)
- Filters low stock items for alerts tab

**Actions:**

#### addProduct
**Purpose:** Creates new product and inventory entry

**Validation:**
- Name required
- Unit price must be > 0
- SKU uniqueness enforced (fails with error message if duplicate)

**Flow:**
1. Insert product into products table
2. Create inventory entry in appropriate shop ONLY
   - Grocery category → grocery shop inventory
   - Spare-parts category → hardware shop inventory
3. Return success message

#### adjustStock
**Purpose:** Add or remove stock quantity

**Validation:**
- Inventory ID required
- Adjustment type must be 'add' or 'remove'
- Quantity must be > 0
- Cannot remove more stock than available

**Flow:**
1. Fetch current inventory record
2. Calculate new quantity (add or subtract)
3. Validate new quantity >= 0
4. Update inventory with new quantity and timestamp
5. Return success message with new quantity

#### updateInventory
**Purpose:** Edit inventory quantity and minimum threshold

**Validation:**
- Inventory ID required
- Quantity must be >= 0
- Minimum threshold must be >= 0

**Flow:**
1. Update inventory record with new values
2. Update lastUpdated timestamp
3. Return success message

#### deleteInventory
**Purpose:** Remove inventory entry

**Validation:**
- Inventory ID required

**Flow:**
1. Delete inventory record from database
2. Return success message

**Note:** Product record remains in products table even if inventory is deleted

---

### Payroll Server
**File:** `src/routes/payroll/+page.server.js`

**Load Function:**
- Fetches all active employees
- Separates full-time and runners

**Actions:**
- `saveEmployee` - Validates and creates employee record
- `calculateMonthlyPayroll` - Batch creates payroll records for full-time
- `calculateDailyPayroll` - Batch creates payroll records for runners

**Validation:**
- Name, type, shop required
- Base salary: USD 200-900
- Daily rate must be > 0

---

### Credits Server
**File:** `src/routes/credits/+page.server.js`

**Load Function:**
- Fetches all credit clients
- Fetches all credit transactions

**Actions:**
- `recordTransaction` - Creates transaction, recalculates client balance

**Flow:**
1. Find or create client
2. Record transaction
3. Sum all client transactions (debits - payments)
4. Update client's totalOwed

---

## Development Guide

### Setup
```bash
# Install dependencies
npm install

# Set up environment variables
echo "DATABASE_URL=file:local.db" > .env

# Generate database migrations
npx drizzle-kit generate

# Run migrations
npx drizzle-kit migrate

# Seed database with default data
npm run db:reset

# Start development server
npm run dev
```

### Database Commands

#### Reset Database
```bash
npm run db:reset
```
**What it does:**
1. Drops all data from all tables
2. Seeds fresh data:
   - 30 grocery items
   - 30 hardware items
   - 17 employees
   - 6 credit clients with sample transactions

**When to use:**
- After schema changes
- To restore default testing data
- To clear out test records

**Script location:** `scripts/reset-db.js`

#### Database Studio
```bash
npx drizzle-kit studio
```
Opens Drizzle Studio web interface to browse and edit database tables directly.

### Database Architecture

**Development Database:**
- SQLite file-based database (`local.db`)
- Created automatically on first run
- Migrations handled by Drizzle Kit

**Seeding System:**
- Idempotent: Won't duplicate data if run multiple times
- Checks for existing products before seeding
- Properly categorizes items by shop
- Creates realistic sample data for testing

### Accessing the App
- Open `http://localhost:5173`
- Auto-redirects to `/dashboard`
- Navigate via top navbar

### Build for Production
```bash
npm run build
npm run preview
```

### Project Structure
```
src/
├── lib/
│   ├── server/
│   │   └── db/
│   │       ├── schema.js          # Database schema definition
│   │       ├── index.js           # Drizzle client (SvelteKit)
│   │       ├── standalone.js      # Drizzle client (standalone scripts)
│   │       └── seed.js            # Database seeding utilities
│   └── components/
│       ├── dashboard/             # NavBar, DashboardCards
│       ├── sales/                 # SalesForm, SalesHistory
│       ├── inventory/             # InventoryTable, AddProduct, AdjustStock, EditInventory
│       ├── payroll/               # EmployeeForm, PayrollCalculator, DailyRunners
│       └── credits/               # CreditForm, CreditLedger
├── routes/
│   ├── +layout.svelte             # Global layout with NavBar
│   ├── +page.svelte               # Root redirect to dashboard
│   ├── dashboard/                 # Dashboard page
│   ├── sales/                     # Sales module
│   ├── inventory/                 # Inventory module (tabbed interface)
│   ├── payroll/                   # Payroll module
│   └── credits/                   # Credits module
├── app.html                       # HTML template
└── app.css                        # Global styles (Tailwind + Material Icons)

scripts/
└── reset-db.js                    # Database reset script

.env                               # Environment variables (DATABASE_URL)
local.db                           # SQLite database file (auto-generated)
```

### Coding Standards

**Rule 1: Boring and Simple**
- No fancy algorithms
- No premature optimization
- Clear, straightforward logic

**Rule 2: Explicit Over Implicit**
- Clear variable names
- Comment the "why" not the "what"
- Separate concerns

**Rule 3: Error Handling**
```javascript
try {
  await db.insert(table).values(data);
  return { success: true };
} catch (err) {
  return { success: false, error: err.message };
}
```

**Rule 4: Form Responses**
```javascript
return {
  success: bool,
  message: string,
  error: string or null
};
```

### Success Criteria

At completion, the system should:
- ✅ Record sales (no overselling)
- ✅ Track inventory across two shops
- ✅ Calculate payroll for employees
- ✅ Handle daily-paid runners separately
- ✅ Track B2B credit balances
- ✅ Show all data on unified dashboard
- ✅ Run with zero manual calculation
- ✅ Have working navigation between all modules
- ✅ All data persisted to SQLite
- ✅ Prioritize low stock alerts on inventory page
- ✅ Allow click-to-edit inventory items
- ✅ Support adding and removing stock
- ✅ Properly categorize products by shop
- ✅ Provide database reset script for testing
- ✅ Work offline with local icon library

---

## Data Constraints

- **Salary range:** USD 200-900 for full-time
- **Transport allowance:** Fixed USD 50
- **Meal allowance:** Fixed USD 25
- **Uniform cost:** Fixed USD 30 per issuance
- **Credit term:** Default 7 days
- **Stock threshold:** Configurable per product, default 5 units
- **Database:** SQLite file-based (local development)
- **Currency:** USD only
- **No authentication:** Single user system

---

## NPM Scripts Reference

### Development
```bash
npm run dev          # Start development server (localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database
```bash
npm run db:reset     # Drop all data and reseed database
npx drizzle-kit generate   # Generate migration files
npx drizzle-kit migrate    # Run migrations
npx drizzle-kit studio     # Open database browser
```

### Common Workflows

**Fresh start:**
```bash
npm run db:reset && npm run dev
```

**After schema changes:**
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
npm run db:reset
```

**View database:**
```bash
npx drizzle-kit studio
# Opens at localhost:4983
```
