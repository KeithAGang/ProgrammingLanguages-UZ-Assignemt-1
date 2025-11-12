import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { sales, credits, payroll, inventory } from '$lib/server/db/schema.js';
import { sql, eq } from 'drizzle-orm';

/**
 * Load dashboard metrics
 * Calculates key business indicators for display
 */
export async function load({ locals }) {
	// Require authentication
	if (!locals.user) {
		throw redirect(303, '/login');
	}
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const todayTimestamp = Math.floor(today.getTime() / 1000);

	// Today's sales total
	const salesResult = await db
		.select({ total: sql`COALESCE(SUM(${sales.totalAmount}), 0)` })
		.from(sales)
		.where(sql`${sales.saleDate} >= ${todayTimestamp}`);
	const todaysSales = Number(salesResult[0]?.total || 0);

	// Outstanding credit total
	const creditsResult = await db
		.select({ total: sql`COALESCE(SUM(${credits.totalOwed}), 0)` })
		.from(credits);
	const outstandingCredit = Number(creditsResult[0]?.total || 0);

	// Payroll due (unpaid records)
	const payrollResult = await db
		.select({ total: sql`COALESCE(SUM(${payroll.totalPay}), 0)` })
		.from(payroll)
		.where(eq(payroll.isPaid, 0));
	const payrollDue = Number(payrollResult[0]?.total || 0);

	// Low stock count
	const lowStockResult = await db
		.select({ count: sql`COUNT(*)` })
		.from(inventory)
		.where(sql`${inventory.quantity} < ${inventory.minThreshold}`);
	const lowStockCount = Number(lowStockResult[0]?.count || 0);

	return {
		todaysSales,
		outstandingCredit,
		payrollDue,
		lowStockCount
	};
}
