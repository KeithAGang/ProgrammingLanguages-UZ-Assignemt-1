# Vincent's Business Automation System

## Project Overview

**Purpose:** Automate record management, sales tracking, inventory control, payroll calculation, and credit management for Vincent's two businesses (grocery shop and hardware spare parts shop).

**Current State:** All operations tracked manually. No digital records. Overwhelming demand but no system to scale.

**Solution:** Build a unified web application to eliminate manual record-keeping across five critical business areas.

**Timeline:** 10 hours | **Team:** 5 developers | **Stack:** JavaScript, SvelteKit, Drizzle ORM, Tailwind CSS, better-sqlite3

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
  - Works with better-sqlite3 for local file-based database
  - Defines schema with `sqliteTable()` functions
  - Queries: insert, select, update, delete operations
  - No migrations needed for this project (dev-only)

### Database Driver
- **better-sqlite3** - Synchronous SQLite driver for Node.js
  - Creates local `data.db` file
  - Simple, fast, perfect for small projects
  - Suitable for MVP/proof-of-concept

### Styling
- **Tailwind CSS 3.x** - Utility-first CSS framework
  - Apply styles directly in HTML: `class="bg-blue-500 p-4 rounded-lg"`
  - No custom CSS files needed
  - Pre-built classes for responsive design
  - Grid, flexbox, spacing, colors all handled via class names

### Frontend Interactivity
- **Svelte 5 Runes** - Reactive primitives for state management
  - `$state` - Create reactive variables
  - `$derived` - Auto-update when dependencies change
  - No useState hooks needed
  - Simple, predictable state management

### Version Control
- **Git** - Collaborative development with feature branches
  - Each developer works on isolated branch
  - Merges into `dev` branch for integration
  - Prevents conflicts with organized folder structure

---

## Database Schema

### Location
```
src/lib/server/db/schema.ts
```

### Schema Definition (All Tables)

#### 1. PRODUCTS TABLE
```javascript
products = sqliteTable('products', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),        // "Rice 10kg", "Engine Oil Synthetic"
  sku: text('sku').unique(),           // Stock Keeping Unit
  category: text('category'),          // 'grocery' or 'spare-parts'
  unitPrice: real('unit_price').notNull(), // USD price per unit
  createdAt: timestamp('created_at').defaultNow(),
});
```
**What it solves:** Central product registry. Both shops reference this when recording sales.

---

#### 2. INVENTORY TABLE
```javascript
inventory = sqliteTable('inventory', {
  id: integer('id').primaryKey(),
  productId: integer('product_id').references(() => products.id),
  shop: text('shop').notNull(),        // 'grocery' or 'hardware'
  quantity: integer('quantity').notNull().default(0), // Current stock
  minThreshold: integer('min_threshold').default(5),  // Alert when below this
  lastUpdated: timestamp('last_updated').defaultNow(),
});
```
**What it solves:** Tracks stock levels per shop. Prevents overselling. Auto-alerts when low.

---

#### 3. SALES TABLE
```javascript
sales = sqliteTable('sales', {
  id: integer('id').primaryKey(),
  shop: text('shop').notNull(),        // 'grocery' or 'hardware'
  productId: integer('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(), // Price at time of sale
  totalAmount: real('total_amount').notNull(), // qty * unitPrice
  saleDate: timestamp('sale_date').defaultNow(), // Auto-timestamp
  notes: text('notes'),                // Optional notes
});
```
**What it solves:** Permanent record of every transaction. Replaces manual sales log.

---

#### 4. EMPLOYEES TABLE
```javascript
employees = sqliteTable('employees', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  employeeType: text('employee_type').notNull(), // 'full-time' or 'runner'
  shop: text('shop'),                  // 'grocery', 'hardware', or 'both'
  baseSalary: integer('base_salary'),  // Monthly salary USD 200-900 (full-time only)
  dailyRate: real('daily_rate'),       // Runners paid daily (e.g., USD 20/day)
  qualifications: text('qualifications'),
  startDate: timestamp('start_date').defaultNow(),
  isActive: integer('is_active').default(1), // Boolean: 1=active, 0=inactive
});
```
**What it solves:** Employee registry. 12 grocery + 5 hardware + X runners. Tracks salary bands.

---

#### 5. PAYROLL TABLE
```javascript
payroll = sqliteTable('payroll', {
  id: integer('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id),
  payPeriod: text('pay_period').notNull(), // 'daily' or 'monthly'
  basePay: real('base_pay'),           // USD 200-900 (from employee.baseSalary)
  transportAllowance: real('transport_allowance').default(0), // Daily allowance
  mealAllowance: real('meal_allowance').default(0),           // Daily allowance
  uniformDeduction: real('uniform_deduction').default(0),     // Cost when uniform issued
  totalPay: real('total_pay').notNull(), // base + allowances - deductions
  payDate: timestamp('pay_date').defaultNow(),
  isPaid: integer('is_paid').default(0), // Boolean: 0=pending, 1=paid
});
```
**What it solves:** Payroll automation. Auto-calculates allowances. Tracks payment status.

---

#### 6. CREDITS TABLE
```javascript
credits = sqliteTable('credits', {
  id: integer('id').primaryKey(),
  clientName: text('client_name').notNull(), // "Joe's Garage", "AutoFix Ltd"
  clientType: text('client_type').default('garage'), // 'garage' or 'other'
  totalOwed: real('total_owed').notNull().default(0), // Running balance
  createdAt: timestamp('created_at').defaultNow(),
});
```
**What it solves:** B2B client registry. Garages buying spare parts on credit.

---

#### 7. CREDIT_TRANSACTIONS TABLE
```javascript
creditTransactions = sqliteTable('credit_transactions', {
  id: integer('id').primaryKey(),
  creditId: integer('credit_id').references(() => credits.id),
  type: text('type').notNull(),        // 'debit' (sale) or 'payment'
  amount: real('amount').notNull(),    // USD amount
  description: text('description'),    // "Sold 10 spark plugs", "Weekly payment"
  transactionDate: timestamp('transaction_date').defaultNow(),
  dueDate: timestamp('due_date'),      // E.g., "Due in 7 days"
});
```
**What it solves:** Credit ledger. Tracks each transaction. Auto-calculates running balance.

---

## Project Directory Structure

```
vincent-business-app/
├── src/
│   ├── lib/
│   │   ├── server/
│   │   │   └── db/
│   │   │       ├── schema.ts          ← DEV 1: Database schema definition
│   │   │       └── client.ts          ← DEV 1: Drizzle client setup
│   │   └── components/
│   │       ├── dashboard/
│   │       │   ├── NavBar.svelte      ← Navigation bar (all pages)
│   │       │   ├── DashboardCards.svelte
│   │       │   └── QuickStats.svelte
│   │       ├── sales/
│   │       │   ├── SalesForm.svelte   ← DEV 2
│   │       │   └── SalesHistory.svelte
│   │       ├── inventory/
│   │       │   ├── InventoryTable.svelte ← DEV 3
│   │       │   ├── LowStockAlert.svelte
│   │       │   └── AddProduct.svelte
│   │       ├── payroll/
│   │       │   ├── EmployeeForm.svelte ← DEV 4
│   │       │   ├── PayrollCalculator.svelte
│   │       │   └── DailyRunners.svelte
│   │       └── credits/
│   │           ├── CreditForm.svelte  ← DEV 5
│   │           └── CreditLedger.svelte
│   └── routes/
│       ├── +layout.svelte             ← Global layout with NavBar
│       ├── dashboard/
│       │   ├── +page.svelte           ← Landing page (DEV 5)
│       │   └── +page.server.js        ← Load dashboard data
│       ├── sales/
│       │   ├── +page.svelte           ← DEV 2
│       │   └── +page.server.js
│       ├── inventory/
│       │   ├── +page.svelte           ← DEV 3
│       │   └── +page.server.js
│       ├── payroll/
│       │   ├── +page.svelte           ← DEV 4
│       │   └── +page.server.js
│       ├── credits/
│       │   ├── +page.svelte           ← DEV 5
│       │   └── +page.server.js
│       └── api/
│           ├── sales/
│           │   └── +server.js         ← API endpoints (optional, for clean separation)
│           ├── inventory/
│           │   └── +server.js
│           ├── payroll/
│           │   └── +server.js
│           └── credits/
│               └── +server.js
├── drizzle.config.ts
├── package.json
├── .env.example
├── .env.local (git-ignored)
├── vite.config.ts
└── README.md (this file)
```

---

## Component Requirements by Developer

### DEV 1: Database & Foundation Setup (2-3 hours)

#### Responsibility
Create the database schema and Drizzle client. This is the foundation everyone builds on.

#### Files to Create

**1. src/lib/server/db/schema.ts**
- Define all 7 tables (see Schema section above)
- Each table must be exported
- Use proper data types: `integer()`, `real()`, `text()`, `timestamp()`
- Add `.notNull()` where required
- Add `.default()` for auto-populated fields
- Add foreign key references with `.references()`

**2. src/lib/server/db/client.ts**
```javascript
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('data.db');
export const db = drizzle(sqlite, { schema });
```

**3. .env.example**
```
DATABASE_URL=file:./data.db
```

#### Definition: What It Solves
- **Problem:** Five modules need unified data source. Different tables = chaos.
- **Solution:** Single schema file that ALL modules import. One source of truth.
- **Output:** Other devs run `npm install`, pull code, and can immediately query tables.

#### Git Workflow
```bash
git checkout -b feature/database
git add src/lib/server/db/
git commit -m "feat(db): drizzle schema and client setup"
git push -u origin feature/database
# Create PR, merge to dev
```

---

### DEV 2: Sales Recording Module (2.5-3 hours)

#### Responsibility
Build the interface for recording transactions. Replace manual sales entry.

#### Components to Create

**1. src/lib/components/sales/SalesForm.svelte**

Purpose: Quick form to record a sale.

Requirements:
- Form fields:
  - Shop dropdown: "Grocery" or "Hardware"
  - Product name/SKU input (autocomplete from products table)
  - Quantity input (number, min 1)
  - Unit price display (read-only, pulled from product)
  - Total amount (auto-calculated: qty × unitPrice)
  - Optional notes text area
- Button: "Record Sale"
- On submit: POST to `/api/sales` with data
- On success: Show "Sale recorded!" message, clear form
- On error: Show error message

Constraints:
- No complex validation. Keep it simple.
- Don't fetch products on every keystroke (debounce or use datalist)
- Store sale with auto-timestamp (server-side)
- Auto-decrement inventory for that product+shop

Styling:
- Use Tailwind: `grid`, `gap-4`, `p-6`, `rounded-lg`, `bg-white`, `shadow`
- Form fields: `border`, `rounded`, `p-2`, `focus:ring`
- Button: `bg-blue-500 hover:bg-blue-600`, `text-white`, `px-4`, `py-2`, `rounded`

---

**2. src/lib/components/sales/SalesHistory.svelte**

Purpose: Show today's sales list.

Requirements:
- Table showing:
  - Time (from saleDate)
  - Shop (grocery/hardware)
  - Product name
  - Qty
  - Unit price
  - Total amount
- Fetch from `/api/sales?date=today`
- Auto-refresh every 30 seconds (optional: button to refresh)
- Show total sales amount (sum of totalAmount column)

Constraints:
- Read-only display
- Simple table format
- No editing or deleting

Styling:
- Table with Tailwind: `table`, `table-auto`, `w-full`, `border-collapse`
- Cells: `border`, `p-2`, `text-left`
- Header: `bg-gray-200`, `font-bold`
- Rows alternate: `even:bg-gray-50`

---

**3. src/routes/sales/+page.svelte**

Purpose: Landing page for sales module.

Requirements:
- Import SalesForm and SalesHistory
- Layout: SalesForm on top, SalesHistory below
- Responsive: stack on mobile, side-by-side on desktop

---

**4. src/routes/sales/+page.server.js**

Purpose: Handle form submission and data loading.

Requirements:
```javascript
import { db } from '$lib/server/db/client';
import { sales, inventory, products } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

// LOAD function: fetch today's sales
export async function load() {
  const today = new Date().toISOString().split('T')[0];
  const todaysSales = await db
    .select({
      id: sales.id,
      shop: sales.shop,
      productName: products.name,
      quantity: sales.quantity,
      unitPrice: sales.unitPrice,
      totalAmount: sales.totalAmount,
      saleDate: sales.saleDate,
    })
    .from(sales)
    .innerJoin(products, eq(sales.productId, products.id))
    .where(sql`DATE(sale_date) = ${today}`);
  
  return { todaysSales };
}

// ACTIONS: handle form submission
export const actions = {
  recordSale: async ({ request }) => {
    const formData = await request.formData();
    const shop = formData.get('shop');
    const productName = formData.get('productName');
    const quantity = parseInt(formData.get('quantity'));
    
    // Find product by name
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.name, productName));
    
    if (!product) {
      return { success: false, error: 'Product not found' };
    }
    
    const totalAmount = quantity * product.unitPrice;
    
    try {
      // Record sale
      await db.insert(sales).values({
        shop,
        productId: product.id,
        quantity,
        unitPrice: product.unitPrice,
        totalAmount,
      });
      
      // Decrement inventory
      await db
        .update(inventory)
        .set({ quantity: sql`quantity - ${quantity}` })
        .where(
          (inventory.productId === product.id) &
          (inventory.shop === shop)
        );
      
      return { success: true, message: 'Sale recorded!' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
};
```

#### Definition: What It Solves
- **Problem:** Manual sales entry. No transaction history. Unreliable data.
- **Solution:** Digital form forces structured data. Auto-timestamps. Permanent DB record.
- **Output:** Every sale recorded with timestamp, shop, product, qty, price. Inventory auto-synced.

#### Constraints
- No payment processing (cash/card handled offline)
- No complex receipt printing (simple text output ok)
- Keep logic simple and obvious

---

### DEV 3: Inventory Management Module (2.5-3 hours)

#### Responsibility
Build interface to track stock levels and trigger low-stock alerts.

#### Components to Create

**1. src/lib/components/inventory/InventoryTable.svelte**

Purpose: Display current stock levels for both shops.

Requirements:
- Table showing:
  - Product name
  - SKU
  - Grocery stock (qty for grocery shop)
  - Hardware stock (qty for hardware shop)
  - Min threshold
  - Status indicator (green=ok, yellow=low, red=critical)
- Filter by shop (dropdown: "All" / "Grocery" / "Hardware")
- Search by product name
- Sort by product name or stock level

Constraints:
- Read-only display
- Simple color coding (Tailwind: `bg-green-100`, `bg-yellow-100`, `bg-red-100`)
- No pagination (show all for MVP)

Styling:
- Same table format as SalesHistory
- Status column: colored badge: `px-2 py-1 rounded text-sm font-bold`

---

**2. src/lib/components/inventory/LowStockAlert.svelte**

Purpose: Alert when products fall below minimum threshold.

Requirements:
- Show all items where `quantity < minThreshold`
- Display: Product name, current qty, threshold, urgency level
- Urgency levels:
  - Red: qty = 0 (out of stock)
  - Orange: qty < (threshold / 2)
  - Yellow: qty < threshold

Constraints:
- Auto-fetch every 1 minute (or on page load)
- Read-only
- Simple list format (not table)

Styling:
- Alert box: `bg-red-50 border-l-4 border-red-500 p-4 rounded`
- Item: `flex justify-between items-center py-2`

---

**3. src/lib/components/inventory/AddProduct.svelte**

Purpose: Add new products to the registry.

Requirements:
- Form fields:
  - Product name (required)
  - SKU (optional)
  - Category dropdown ("Grocery" or "Spare Parts")
  - Unit price (currency, USD)
  - Min threshold (number)
- Button: "Add Product"
- On success: Show message, clear form
- On error: Show error

Constraints:
- Prevent duplicate SKU
- Simple validation: name required, price > 0
- No complex UX

Styling:
- Same as SalesForm

---

**4. src/routes/inventory/+page.svelte**

Requirements:
- Layout: LowStockAlert at top, InventoryTable below, AddProduct in modal/sidebar
- Responsive grid

---

**5. src/routes/inventory/+page.server.js**

Requirements:
```javascript
export async function load() {
  // Fetch all inventory with product info
  const allInventory = await db
    .select({
      id: inventory.id,
      productName: products.name,
      sku: products.sku,
      shop: inventory.shop,
      quantity: inventory.quantity,
      minThreshold: inventory.minThreshold,
    })
    .from(inventory)
    .innerJoin(products, eq(inventory.productId, products.id));
  
  // Calculate status
  const withStatus = allInventory.map(item => ({
    ...item,
    status: item.quantity === 0 ? 'out-of-stock' 
           : item.quantity < item.minThreshold ? 'low'
           : 'ok',
  }));
  
  return { inventory: withStatus };
}

export const actions = {
  addProduct: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name');
    const sku = formData.get('sku');
    const category = formData.get('category');
    const unitPrice = parseFloat(formData.get('unitPrice'));
    const minThreshold = parseInt(formData.get('minThreshold'));
    
    if (!name || unitPrice <= 0) {
      return { success: false, error: 'Invalid input' };
    }
    
    try {
      await db.insert(products).values({
        name,
        sku: sku || null,
        category,
        unitPrice,
      });
      
      return { success: true, message: 'Product added!' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
};
```

#### Definition: What It Solves
- **Problem:** Manual stock tracking. No alerts. Overselling risk.
- **Solution:** Central inventory view. Auto-alerts on low stock. Sync with sales.
- **Output:** Real-time stock levels. Visual warnings. No surprise stockouts.

#### Constraints
- No barcode scanning (manual entry ok)
- No multi-location transfers (assume one DB per shop for now)
- Simple threshold logic (no AI predictions)

---

### DEV 4: Payroll Management Module (2.5-3 hours)

#### Responsibility
Automate payroll calculation and track payments.

#### Components to Create

**1. src/lib/components/payroll/EmployeeForm.svelte**

Purpose: Register or update employee details.

Requirements:
- Form fields:
  - Name (required)
  - Employee type dropdown: "Full-time" or "Runner"
  - Shop dropdown: "Grocery", "Hardware", "Both"
  - For full-time: Base salary input (USD 200-900)
  - For runners: Daily rate input (e.g., USD 20/day)
  - Qualifications text area
  - Is active checkbox (default checked)
- Button: "Save Employee"
- On success: Confirm, refresh list
- On error: Show error

Constraints:
- Salary validation: 200 ≤ salary ≤ 900
- Simple validation only
- No role-based permissions

Styling:
- Same form pattern as other modules

---

**2. src/lib/components/payroll/PayrollCalculator.svelte**

Purpose: Auto-calculate and generate payroll.

Requirements:
- Button: "Calculate Monthly Payroll"
- Shows:
  - List of all full-time employees
  - For each: name, base salary, transport allowance (+50), meal allowance (+25), uniform deduction (-0 or -30), total pay
  - Sum of all totals
  - Grand total for the month
- Button: "Confirm and Save to Payroll"
- On submit: Create payroll records for all employees, mark as pending

Constraints:
- Transport allowance: Fixed USD 50 per employee per month
- Meal allowance: Fixed USD 25 per employee per month
- Uniform deduction: USD 30 only if uniform issued this month (checkbox per employee)
- Calculation: (base + 50 + 25) - uniform_deduction
- All calculations should be boring and straightforward

Styling:
- Table showing calculation breakdown
- Highlight total row: `bg-blue-100 font-bold`

---

**3. src/lib/components/payroll/DailyRunners.svelte**

Purpose: Track daily-paid runners separately.

Requirements:
- Table showing:
  - Runner name
  - Daily rate
  - Days worked (select date range or input count)
  - Total pay (daily_rate × days_worked + 50 + 25)
- Input fields for each runner to select days worked
- Button: "Calculate and Save Daily Payroll"
- On submit: Create payroll records for runners

Constraints:
- Runners get same allowances as full-time (transport + meal)
- No overtime multiplier
- Simple day counting (no time tracking)

Styling:
- Table format, simple

---

**4. src/routes/payroll/+page.svelte**

Requirements:
- Layout: EmployeeForm (top), PayrollCalculator (middle), DailyRunners (bottom)
- Show list of employees below
- Show recent payroll records (last 3 months)

---

**5. src/routes/payroll/+page.server.js**

Requirements:
```javascript
export async function load() {
  // Fetch all active employees
  const allEmployees = await db
    .select()
    .from(employees)
    .where(eq(employees.isActive, 1));
  
  // Separate full-time and runners
  const fullTime = allEmployees.filter(e => e.employeeType === 'full-time');
  const runners = allEmployees.filter(e => e.employeeType === 'runner');
  
  // Fetch recent payroll
  const recentPayroll = await db
    .select()
    .from(payroll)
    .orderBy(desc(payroll.payDate))
    .limit(30);
  
  return { fullTime, runners, recentPayroll };
}

export const actions = {
  calculateMonthlyPayroll: async ({ request }) => {
    const formData = await request.formData();
    const fullTimeIds = JSON.parse(formData.get('fullTimeIds'));
    const uniformDeductionIds = JSON.parse(formData.get('uniformDeductionIds'));
    
    const selectedEmployees = await db
      .select()
      .from(employees)
      .where(inArray(employees.id, fullTimeIds));
    
    const payrollRecords = selectedEmployees.map(emp => ({
      employeeId: emp.id,
      payPeriod: 'monthly',
      basePay: emp.baseSalary,
      transportAllowance: 50,
      mealAllowance: 25,
      uniformDeduction: uniformDeductionIds.includes(emp.id) ? 30 : 0,
      totalPay: emp.baseSalary + 50 + 25 - (uniformDeductionIds.includes(emp.id) ? 30 : 0),
      isPaid: 0,
    }));
    
    try {
      await db.insert(payroll).values(payrollRecords);
      return { success: true, message: 'Payroll calculated!', total: payrollRecords.length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  calculateDailyPayroll: async ({ request }) => {
    const formData = await request.formData();
    const runnerPayroll = JSON.parse(formData.get('runnerPayroll'));
    
    const payrollRecords = runnerPayroll.map(item => ({
      employeeId: item.employeeId,
      payPeriod: 'daily',
      basePay: item.dailyRate * item.daysWorked,
      transportAllowance: 50,
      mealAllowance: 25,
      uniformDeduction: 0,
      totalPay: (item.dailyRate * item.daysWorked) + 50 + 25,
      isPaid: 0,
    }));
    
    try {
      await db.insert(payroll).values(payrollRecords);
      return { success: true, message: 'Daily payroll calculated!' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  saveEmployee: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name');
    const employeeType = formData.get('employeeType');
    const shop = formData.get('shop');
    const baseSalary = employeeType === 'full-time' ? parseInt(formData.get('baseSalary')) : null;
    const dailyRate = employeeType === 'runner' ? parseFloat(formData.get('dailyRate')) : null;
    
    if (!name || baseSalary < 200 || baseSalary > 900) {
      return { success: false, error: 'Invalid employee data' };
    }
    
    try {
      await db.insert(employees).values({
        name,
        employeeType,
        shop,
        baseSalary,
        dailyRate,
      });
      return { success: true, message: 'Employee added!' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
};
```

#### Definition: What It Solves
- **Problem:** Manual payroll math. 17 people × variable pay = error-prone. Runners paid differently than salaried.
- **Solution:** Automated calculation. Daily + monthly handling. All allowances included. Payment tracking.
- **Output:** One-click payroll generation. All 17 people paid correctly. No math errors. Audit trail.

#### Constraints
- No automatic payment processing (just generate payroll records)
- Fixed allowances (not variable)
- Simple: boring math, no complexity
- No tax calculations (out of scope)

---

### DEV 5: Credit Management & Dashboard (2.5-3 hours)

#### Responsibility
Track B2B credit transactions and build landing dashboard.

#### Components to Create

**1. src/lib/components/credits/CreditForm.svelte**

Purpose: Record new credit sales or payments.

Requirements:
- Form fields:
  - Client name dropdown (auto-complete from existing credits) OR text input to add new
  - Transaction type radio: "New Sale" or "Payment"
  - Amount (currency)
  - Description (optional)
  - Due date (if new sale, default 7 days out)
- Button: "Record Transaction"
- On success: Confirm, update running balance
- On error: Show error

Constraints:
- No validation beyond amount > 0
- Simple date picking (HTML date input)
- Auto-calculate running balance after transaction

---

**2. src/lib/components/credits/CreditLedger.svelte**

Purpose: Show credit balance and transaction history per client.

Requirements:
- Select client dropdown
- Display:
  - Client name
  - Total owed (current balance)
  - Days overdue (if due_date < today)
  - Urgency status (red if >30 days overdue, yellow if >7 days, green if current)
  - Transaction history table:
    - Date
    - Type (Debit/Payment)
    - Amount
    - Description
    - Running balance after transaction

Constraints:
- Read-only display
- Simple balance calculation (sum debits - sum payments)
- Sort transactions by date (newest first)

Styling:
- Status badge: color-coded
- Balance highlight: larger, bold
- Table with alternating row colors

---

**3. src/lib/components/dashboard/DashboardCards.svelte**

Purpose: Display key metrics at a glance.

Requirements:
- Four cards showing:
  1. Today's sales total (USD)
  2. Total outstanding credit (USD)
  3. Payroll due this month (USD)
  4. Low stock items count
- Auto-refresh every 2 minutes
- Each card: big number + label

Styling:
- Grid: 4 columns on desktop, 2 on tablet, 1 on mobile
- Card: `bg-white p-6 rounded-lg shadow hover:shadow-lg`
- Number: `text-3xl font-bold text-blue-600`
- Label: `text-gray-600 text-sm mt-2`

---

**4. src/lib/components/dashboard/NavBar.svelte**

Purpose: Main navigation for all modules.

Requirements:
- Logo/title: "Vincent's Business Hub"
- Navigation links:
  - Dashboard
  - Sales
  - Inventory
  - Payroll
  - Credits
- Responsive: hamburger menu on mobile

Styling:
- Background: dark (`bg-gray-800`)
- Text: white
- Active link highlight (`bg-blue-600`)
- Sticky positioning (`sticky top-0`)

---

**5. src/routes/+layout.svelte** (Global Layout)

Purpose: Wrap entire app with navigation.

Requirements:
```svelte
<script>
  import NavBar from '$lib/components/dashboard/NavBar.svelte';
</script>

<NavBar />

<main class="bg-gray-50 min-h-screen">
  <slot />
</main>

<style global>
  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, sans-serif;
  }
</style>
```

---

**6. src/routes/dashboard/+page.svelte** (Landing Page)

Requirements:
```svelte
<script>
  import DashboardCards from '$lib/components/dashboard/DashboardCards.svelte';
  
  export let data;
  
  const stats = $derived.by(() => ({
    todaysSales: data.todaysSales,
    outstandingCredit: data.outstandingCredit,
    payrollDue: data.payrollDue,
    lowStockCount: data.lowStockCount,
  }));
</script>

<div class="p-8 max-w-7xl mx-auto">
  <h1 class="text-4xl font-bold mb-8">Dashboard</h1>
  
  <DashboardCards {...stats} />
  
  <div class="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
    <a href="/sales" class="block p-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center">
      <div class="text-2xl mb-2">💰</div>
      <div class="font-bold">Record Sale</div>
    </a>
    <a href="/inventory" class="block p-6 bg-green-500 text-white rounded-lg hover:bg-green-600 text-center">
      <div class="text-2xl mb-2">📦</div>
      <div class="font-bold">Check Stock</div>
    </a>
    <a href="/payroll" class="block p-6 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-center">
      <div class="text-2xl mb-2">👥</div>
      <div class="font-bold">Payroll</div>
    </a>
    <a href="/credits" class="block p-6 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-center">
      <div class="text-2xl mb-2">💳</div>
      <div class="font-bold">Credits</div>
    </a>
  </div>
</div>
```

---

**7. src/routes/dashboard/+page.server.js** (Load Dashboard Data)

Requirements:
```javascript
import { db } from '$lib/server/db/client';
import { sales, credits, creditTransactions, payroll, inventory, products } from '$lib/server/db/schema';
import { sql, desc, eq } from 'drizzle-orm';

export async function load() {
  const today = new Date().toISOString().split('T')[0];
  
  // Today's sales
  const [todaysSalesData] = await db
    .select({ total: sql`SUM(total_amount)` })
    .from(sales)
    .where(sql`DATE(sale_date) = ${today}`);
  const todaysSales = todaysSalesData?.total || 0;
  
  // Outstanding credit
  const allCredits = await db.select().from(credits);
  const outstandingCredit = allCredits.reduce((sum, c) => sum + (c.totalOwed || 0), 0);
  
  // Payroll due this month (unpaid records)
  const [payrollData] = await db
    .select({ total: sql`SUM(total_pay)` })
    .from(payroll)
    .where(eq(payroll.isPaid, 0));
  const payrollDue = payrollData?.total || 0;
  
  // Low stock count
  const lowStockItems = await db
    .select({ count: sql`COUNT(*)` })
    .from(inventory)
    .where(sql`quantity < min_threshold`);
  const lowStockCount = lowStockItems[0]?.count || 0;
  
  return {
    todaysSales,
    outstandingCredit,
    payrollDue,
    lowStockCount,
  };
}
```

---

**8. src/routes/credits/+page.svelte** (Credits Module)

Requirements:
- Layout: CreditForm (left), CreditLedger (right)
- Responsive: stack on mobile

---

**9. src/routes/credits/+page.server.js**

Requirements:
```javascript
export async function load() {
  const allCredits = await db.select().from(credits);
  
  return { credits: allCredits };
}

export const actions = {
  recordTransaction: async ({ request }) => {
    const formData = await request.formData();
    const clientName = formData.get('clientName');
    const type = formData.get('type'); // 'debit' or 'payment'
    const amount = parseFloat(formData.get('amount'));
    const description = formData.get('description');
    
    if (amount <= 0) {
      return { success: false, error: 'Invalid amount' };
    }
    
    try {
      // Find or create client
      let [client] = await db
        .select()
        .from(credits)
        .where(eq(credits.clientName, clientName));
      
      if (!client) {
        const result = await db.insert(credits).values({ clientName }).returning();
        client = result[0];
      }
      
      // Record transaction
      await db.insert(creditTransactions).values({
        creditId: client.id,
        type,
        amount,
        description,
      });
      
      // Update total owed
      const transactions = await db
        .select()
        .from(creditTransactions)
        .where(eq(creditTransactions.creditId, client.id));
      
      const totalOwed = transactions.reduce((sum, t) => {
        return t.type === 'debit' ? sum + t.amount : sum - t.amount;
      }, 0);
      
      await db
        .update(credits)
        .set({ totalOwed })
        .where(eq(credits.id, client.id));
      
      return { success: true, message: 'Transaction recorded!' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
};
```

#### Definition: What It Solves
- **Problem:** B2B credit sales tracked manually. Garages don't pay weekly = cash flow unclear. No overdue tracking.
- **Solution:** Digital ledger per client. Auto-calculates running balance. Flags overdue accounts. Clear settlement tracking.
- **Output:** "Joe's Garage owes USD 500, payment due in 2 days." Visual urgency. Better cash management.

#### Constraints
- No automatic payment reminders (UI only)
- No multi-currency (USD only)
- Simple 7-day payment term (hardcoded)

---

## Constraints & Limitations (All Modules)

### Data Constraints
- **Salary range:** USD 200-900 for full-time employees
- **Daily allowances:** Fixed (transport USD 50, meal USD 25)
- **Uniform cost:** Fixed USD 30 per issuance
- **Runner day rate:** Variable per employee, set during registration
- **Credit term:** Default 7 days (hardcoded)
- **Stock threshold:** Configurable per product, min default 5 units
- **Sale timestamp:** Auto-recorded by server (no manual time override)

### Technical Constraints
- **Database:** SQLite only (file-based, single user, local development)
- **No real-time sync:** Page refresh needed to see updates
- **No PDF export:** Simple table display only
- **No payment gateway:** Credit/debit transactions are manual records only
- **No email notifications:** All alerts are UI-based only
- **No authentication:** Single user (Vincent only)
- **No image uploads:** Text/numbers only
- **No bulk import:** Manual entry or CSV extension (out of scope)

### Scope Constraints
- **No tax calculations:** Out of scope
- **No multi-currency:** USD only
- **No role-based access:** Everyone sees everything
- **No advanced reporting:** Simple table views only
- **No time tracking:** Runner days are manual input
- **No barcode scanning:** Product lookup by name/SKU text
- **No automated reordering:** Manual stock entry only

---

## Coding Standards & Guidelines

### All JavaScript/TypeScript Files

**Rule 1: Boring and Intentionally Simple**
- No fancy algorithms
- No abstractions over abstractions
- No premature optimization
- If you can do it in 10 lines, don't make it 50

**Rule 2: Explicit Over Implicit**
- Name variables clearly: `totalPayAmount` not `tp`
- Comment the "why" not the "what"
- Separate concerns: database, UI, logic

**Rule 3: Database Operations**
```javascript
// GOOD: Clear, simple, easy to debug
const employee = await db
  .select()
  .from(employees)
  .where(eq(employees.id, empId));

// BAD: Too clever, hard to understand
const emp = (await db.query(employees).filter(e => e.id === id))[0];
```

**Rule 4: Error Handling**
```javascript
// Always wrap async operations in try-catch
try {
  await db.insert(sales).values(data);
  return { success: true };
} catch (err) {
  return { success: false, error: err.message };
}
```

**Rule 5: Form Data Processing**
```javascript
// Always validate and parse
const quantity = parseInt(formData.get('quantity'));
if (isNaN(quantity) || quantity < 1) {
  return { success: false, error: 'Invalid quantity' };
}
```

### All Svelte Components

**Rule 1: Use Svelte 5 Runes**
```svelte
<script>
  // GOOD: Reactive state
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  // BAD: Old Svelte 4 style
  let count = 0;
  $: doubled = count * 2;
</script>
```

**Rule 2: Props are Explicit**
```svelte
<script>
  export let sales = [];
  export let shopFilter = 'all';
</script>
```

**Rule 3: Form Handling**
```svelte
<form method="POST" action="?/recordSale">
  <input name="shop" value="grocery" />
  <button type="submit">Save</button>
</form>
```

**Rule 4: Styling with Tailwind Only**
```svelte
<!-- GOOD: Tailwind classes -->
<div class="bg-white p-6 rounded-lg shadow">
  
<!-- BAD: Custom CSS -->
<div style="background: white; padding: 24px;">
```

**Rule 5: No Complex Logic in Templates**
```svelte
<!-- GOOD: Derived state -->
{#each filteredItems as item (item.id)}

<!-- BAD: Filter in template -->
{#each items.filter(i => i.active) as item}
```

### All Routes (+page.server.js)

**Rule 1: Separate Load and Actions**
```javascript
export async function load() {
  // Fetch data for display
  return { data };
}

export const actions = {
  actionName: async ({ request }) => {
    // Handle form submission
    return { success: true };
  }
};
```

**Rule 2: Always Return Structured Response**
```javascript
return {
  success: bool,
  message: string,
  data: object or null,
  error: string or null,
};
```

---

## Documentation Requirements

### Each Module Must Include

**For every component and route, provide:**

1. **What it is** (1 sentence)
   - Example: "SalesForm is the UI for recording individual product sales."

2. **What it solves** (the business problem)
   - Example: "Replaces manual sales log. Ensures every transaction is recorded with timestamp and auto-synced inventory."

3. **How it works** (basic flow)
   - Example: "User fills form → clicks Submit → POST to +page.server.js → inserts into sales table → decrements inventory → returns success."

4. **Inputs & outputs**
   - Inputs: Form fields, props, URL params
   - Outputs: Database records, UI feedback

5. **Constraints**
   - What it does NOT do
   - Limitations

**Format: JSDoc + Inline Comments**

```javascript
/**
 * Sales recording form handler
 * 
 * WHAT IT SOLVES:
 * - Manual sales entry replaced with structured digital form
 * - Every transaction timestamped and permanently stored
 * - Inventory auto-decremented to prevent overselling
 * 
 * FLOW:
 * 1. User selects shop, product, quantity
 * 2. Unit price auto-filled from product table
 * 3. Total calculated (qty × unitPrice)
 * 4. Form submitted via POST
 * 5. Server inserts sale record + decrements inventory
 * 6. Success message returned
 * 
 * CONSTRAINTS:
 * - No payment processing (offline only)
 * - No receipt printing
 * - Quantity must be > 0
 */

export const actions = {
  recordSale: async ({ request }) => {
    // ... implementation
  }
};
```

---

## File Structure Checklist

Before merging, ensure every file exists:

### DEV 1
- [ ] `src/lib/server/db/schema.ts` - 7 tables defined
- [ ] `src/lib/server/db/client.ts` - Drizzle client
- [ ] `.env.example` - Database path example

### DEV 2
- [ ] `src/lib/components/sales/SalesForm.svelte`
- [ ] `src/lib/components/sales/SalesHistory.svelte`
- [ ] `src/routes/sales/+page.svelte`
- [ ] `src/routes/sales/+page.server.js`

### DEV 3
- [ ] `src/lib/components/inventory/InventoryTable.svelte`
- [ ] `src/lib/components/inventory/LowStockAlert.svelte`
- [ ] `src/lib/components/inventory/AddProduct.svelte`
- [ ] `src/routes/inventory/+page.svelte`
- [ ] `src/routes/inventory/+page.server.js`

### DEV 4
- [ ] `src/lib/components/payroll/EmployeeForm.svelte`
- [ ] `src/lib/components/payroll/PayrollCalculator.svelte`
- [ ] `src/lib/components/payroll/DailyRunners.svelte`
- [ ] `src/routes/payroll/+page.svelte`
- [ ] `src/routes/payroll/+page.server.js`

### DEV 5
- [ ] `src/lib/components/credits/CreditForm.svelte`
- [ ] `src/lib/components/credits/CreditLedger.svelte`
- [ ] `src/lib/components/dashboard/DashboardCards.svelte`
- [ ] `src/lib/components/dashboard/NavBar.svelte`
- [ ] `src/routes/+layout.svelte`
- [ ] `src/routes/dashboard/+page.svelte`
- [ ] `src/routes/dashboard/+page.server.js`
- [ ] `src/routes/credits/+page.svelte`
- [ ] `src/routes/credits/+page.server.js`

---

## Git Workflow Summary

### Hour 0-1: Setup
```bash
git clone <repo>
git checkout dev
npm install
```

### Hour 1-3: DEV 1
```bash
git checkout -b feature/database
# Create schema and client
git push -u origin feature/database
# Merge to dev
```

### Hour 3-8: DEV 2-5 (Parallel)
```bash
# Each dev
git checkout dev
git pull
git checkout -b feature/<their-module>
# Build components and routes
git push -u origin feature/<their-module>
# Commit every 30 mins
```

### Hour 8-9: Merge
```bash
git checkout dev
git pull
git merge feature/sales-module --no-ff
git merge feature/inventory --no-ff
git merge feature/payroll --no-ff
git merge feature/credits-dashboard --no-ff
git push
```

### Hour 9-10: Test & Deploy
```bash
npm run dev
npm run build
# Test each module
```

---

## Running the Project

### Setup
```bash
npm install
npm run dev
```

### Database
- SQLite database auto-created in `data.db`
- Schema auto-initialized on first run
- No migrations needed

### Accessing the App
- Open `http://localhost:5173`
- Should land on dashboard
- Navigate via top navbar

---

## Quick Reference: What Each Module Solves

| Module | Problem | Solution |
|--------|---------|----------|
| **Sales** | Manual transaction entry, no history | Digital form, timestamped records, inventory sync |
| **Inventory** | Manual stock tracking, overselling risk | Real-time stock view, low-stock alerts, auto-sync with sales |
| **Payroll** | Manual math for 17 employees, salary errors | Auto-calculation, all allowances included, runners tracked separately |
| **Credits** | Manual B2B ledger, unclear cash flow | Digital ledger per client, running balance, overdue tracking |
| **Dashboard** | No consolidated view of business health | Real-time metrics, quick navigation, visual status |

---

## Success Criteria (10 Hour Sprint)

✅ **At 10 hours, the system should:**
- [ ] Record sales (no overselling)
- [ ] Track inventory across two shops
- [ ] Calculate payroll for 17 employees (salaries + allowances)
- [ ] Handle daily-paid runners separately
- [ ] Track B2B credit balances
- [ ] Show all data on unified dashboard
- [ ] Run with zero manual calculation
- [ ] Have working navigation between all modules
- [ ] All data persisted to SQLite

---

## Notes for Claude Code

- **Be explicit:** Every function should be obvious. No clever tricks.
- **Be boring:** Simple loops, simple math, simple queries.
- **Be complete:** Each file is production-ready (not placeholder).
- **Be documented:** Every section has JSDoc + inline comments.
- **Be tested:** Each module works independently before merge.
- **Be consistent:** Follow the patterns shown in examples exactly.

This README is your spec. Follow it precisely.s