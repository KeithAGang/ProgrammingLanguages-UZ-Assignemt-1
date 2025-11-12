/**
 * Database Schema for Vincent's Business Automation System
 *
 * WHAT IT SOLVES:
 * - Unified data structure for sales, inventory, payroll, and credit management
 * - Central product registry for both shops
 * - Employee and payroll tracking
 * - B2B credit transaction ledger
 *
 * TABLES:
 * 1. products - Central product catalog
 * 2. inventory - Stock levels per shop
 * 3. sales - Transaction history
 * 4. employees - Employee registry
 * 5. payroll - Payroll calculation records
 * 6. credits - B2B client accounts
 * 7. creditTransactions - Credit transaction ledger
 * 8. users - User accounts for authentication
 * 9. sessions - User session tracking
 */

import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 1. PRODUCTS TABLE
// Central product registry for both shops
export const products = sqliteTable('products', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	sku: text('sku').unique(),
	category: text('category'), // 'grocery' or 'spare-parts'
	unitPrice: real('unit_price').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// 2. INVENTORY TABLE
// Tracks stock levels per shop with low-stock alerts
export const inventory = sqliteTable('inventory', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	productId: integer('product_id')
		.notNull()
		.references(() => products.id),
	shop: text('shop').notNull(), // 'grocery' or 'hardware'
	quantity: integer('quantity').notNull().default(0),
	minThreshold: integer('min_threshold').default(5),
	lastUpdated: integer('last_updated', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// 3. SALES TABLE
// Permanent record of every transaction
export const sales = sqliteTable('sales', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	shop: text('shop').notNull(), // 'grocery' or 'hardware'
	productId: integer('product_id')
		.notNull()
		.references(() => products.id),
	quantity: integer('quantity').notNull(),
	unitPrice: real('unit_price').notNull(),
	totalAmount: real('total_amount').notNull(),
	saleDate: integer('sale_date', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	notes: text('notes')
});

// 4. EMPLOYEES TABLE
// Employee registry for both full-time and daily runners
export const employees = sqliteTable('employees', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	employeeType: text('employee_type').notNull(), // 'full-time' or 'runner'
	shop: text('shop'), // 'grocery', 'hardware', or 'both'
	baseSalary: integer('base_salary'), // Monthly salary USD 200-900 (full-time only)
	dailyRate: real('daily_rate'), // Runners paid daily (e.g., USD 20/day)
	qualifications: text('qualifications'),
	startDate: integer('start_date', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	isActive: integer('is_active').default(1) // Boolean: 1=active, 0=inactive
});

// 5. PAYROLL TABLE
// Payroll calculation and payment tracking
export const payroll = sqliteTable('payroll', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	employeeId: integer('employee_id')
		.notNull()
		.references(() => employees.id),
	payPeriod: text('pay_period').notNull(), // 'daily' or 'monthly'
	basePay: real('base_pay'),
	transportAllowance: real('transport_allowance').default(0),
	mealAllowance: real('meal_allowance').default(0),
	uniformDeduction: real('uniform_deduction').default(0),
	totalPay: real('total_pay').notNull(),
	payDate: integer('pay_date', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	isPaid: integer('is_paid').default(0) // Boolean: 0=pending, 1=paid
});

// 6. CREDITS TABLE
// B2B client registry
export const credits = sqliteTable('credits', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	clientName: text('client_name').notNull(),
	clientType: text('client_type').default('garage'), // 'garage' or 'other'
	totalOwed: real('total_owed').notNull().default(0),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// 7. CREDIT_TRANSACTIONS TABLE
// Credit transaction ledger
export const creditTransactions = sqliteTable('credit_transactions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	creditId: integer('credit_id')
		.notNull()
		.references(() => credits.id),
	type: text('type').notNull(), // 'debit' (sale) or 'payment'
	amount: real('amount').notNull(),
	description: text('description'),
	transactionDate: integer('transaction_date', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	dueDate: integer('due_date', { mode: 'timestamp' })
});

// 8. USERS TABLE
// User accounts for authentication
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	name: text('name').notNull(),
	role: text('role').notNull().default('user'), // 'admin' or 'user'
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// 9. SESSIONS TABLE
// User session tracking for authentication
export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(), // UUID session token
	userId: integer('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});
