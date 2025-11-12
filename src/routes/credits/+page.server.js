import { db } from '$lib/server/db/index.js';
import { credits, creditTransactions } from '$lib/server/db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export async function load() {
	const allCredits = await db.select().from(credits);
	const allTransactions = await db.select().from(creditTransactions);

	return {
		clients: allCredits,
		transactions: allTransactions
	};
}

export const actions = {
	recordTransaction: async ({ request }) => {
		const formData = await request.formData();
		const clientName = formData.get('clientName');
		const type = formData.get('type');
		const amount = parseFloat(formData.get('amount'));
		const description = formData.get('description') || null;
		const dueDateStr = formData.get('dueDate');

		if (!clientName || !type || !amount || amount <= 0) {
			return fail(400, { error: 'Invalid input data', success: false });
		}

		try {
			// Find or create client
			let client = await db.select().from(credits).where(eq(credits.clientName, clientName));

			if (client.length === 0) {
				const result = await db
					.insert(credits)
					.values({ clientName, totalOwed: 0 })
					.returning();
				client = result;
			}

			const clientId = client[0].id;

			// Convert due date to timestamp if provided
			let dueDate = null;
			if (dueDateStr && type === 'debit') {
				dueDate = Math.floor(new Date(dueDateStr).getTime() / 1000);
			}

			// Record transaction
			await db.insert(creditTransactions).values({
				creditId: clientId,
				type,
				amount,
				description,
				dueDate
			});

			// Recalculate total owed
			const allClientTransactions = await db
				.select()
				.from(creditTransactions)
				.where(eq(creditTransactions.creditId, clientId));

			const totalOwed = allClientTransactions.reduce((sum, t) => {
				return t.type === 'debit' ? sum + t.amount : sum - t.amount;
			}, 0);

			// Update client's total owed
			await db
				.update(credits)
				.set({ totalOwed: Math.max(0, totalOwed) })
				.where(eq(credits.id, clientId));

			return { success: true, message: 'Transaction recorded successfully!' };
		} catch (err) {
			console.error('Error recording transaction:', err);
			return fail(500, { error: err.message, success: false });
		}
	}
};
