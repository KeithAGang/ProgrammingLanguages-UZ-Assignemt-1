import { db } from '$lib/server/db/index.js';
import { sales, inventory, products } from '$lib/server/db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export async function load() {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const todayTimestamp = Math.floor(today.getTime() / 1000);

	// Fetch all products
	const allProducts = await db.select().from(products);

	// Fetch today's sales with product names
	const todaysSales = await db
		.select({
			id: sales.id,
			shop: sales.shop,
			productName: products.name,
			quantity: sales.quantity,
			unitPrice: sales.unitPrice,
			totalAmount: sales.totalAmount,
			saleDate: sales.saleDate,
			notes: sales.notes
		})
		.from(sales)
		.innerJoin(products, eq(sales.productId, products.id))
		.where(sql`${sales.saleDate} >= ${todayTimestamp}`)
		.orderBy(sql`${sales.saleDate} DESC`);

	return {
		products: allProducts,
		todaysSales
	};
}

export const actions = {
	recordSale: async ({ request }) => {
		const formData = await request.formData();
		const shop = formData.get('shop');
		const productId = parseInt(formData.get('productId'));
		const quantity = parseInt(formData.get('quantity'));
		const notes = formData.get('notes') || null;

		// Validate inputs
		if (!shop || !productId || !quantity || quantity < 1) {
			return fail(400, { error: 'Invalid input data', success: false });
		}

		try {
			// Find product
			const [product] = await db.select().from(products).where(eq(products.id, productId));

			if (!product) {
				return fail(404, { error: 'Product not found', success: false });
			}

			const totalAmount = quantity * product.unitPrice;

			// Record sale
			await db.insert(sales).values({
				shop,
				productId,
				quantity,
				unitPrice: product.unitPrice,
				totalAmount,
				notes
			});

			// Update inventory (decrement stock)
			const [inventoryRecord] = await db
				.select()
				.from(inventory)
				.where(sql`${inventory.productId} = ${productId} AND ${inventory.shop} = ${shop}`);

			if (inventoryRecord) {
				await db
					.update(inventory)
					.set({
						quantity: sql`${inventory.quantity} - ${quantity}`,
						lastUpdated: sql`(unixepoch())`
					})
					.where(eq(inventory.id, inventoryRecord.id));
			}

			return { success: true, message: 'Sale recorded successfully!' };
		} catch (err) {
			console.error('Error recording sale:', err);
			return fail(500, { error: err.message, success: false });
		}
	}
};
