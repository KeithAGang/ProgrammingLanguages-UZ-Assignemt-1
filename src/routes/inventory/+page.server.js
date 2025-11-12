import { db } from '$lib/server/db/index.js';
import { inventory, products } from '$lib/server/db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	// Require authentication
	if (!locals.user) {
		throw redirect(303, '/login');
	}
	// Fetch all inventory with product info
	const allInventory = await db
		.select({
			id: inventory.id,
			productName: products.name,
			sku: products.sku,
			shop: inventory.shop,
			quantity: inventory.quantity,
			minThreshold: inventory.minThreshold
		})
		.from(inventory)
		.innerJoin(products, eq(inventory.productId, products.id));

	// Calculate status for each item
	const inventoryWithStatus = allInventory.map((item) => ({
		...item,
		status:
			item.quantity === 0 ? 'out-of-stock' : item.quantity < item.minThreshold ? 'low' : 'ok'
	}));

	// Filter low stock items
	const lowStockItems = inventoryWithStatus.filter((item) => item.quantity < item.minThreshold);

	return {
		inventory: inventoryWithStatus,
		lowStockItems
	};
}

export const actions = {
	addProduct: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const sku = formData.get('sku') || null;
		const category = formData.get('category');
		const unitPrice = parseFloat(formData.get('unitPrice'));
		const minThreshold = parseInt(formData.get('minThreshold')) || 5;

		// Validate inputs
		if (!name || !unitPrice || unitPrice <= 0) {
			return fail(400, { error: 'Invalid input: name and valid unit price required', success: false });
		}

		try {
			// Insert product
			const result = await db
				.insert(products)
				.values({
					name,
					sku,
					category,
					unitPrice
				})
				.returning();

			const newProduct = result[0];

			// Create inventory entries for both shops
			await db.insert(inventory).values([
				{
					productId: newProduct.id,
					shop: 'grocery',
					quantity: 0,
					minThreshold
				},
				{
					productId: newProduct.id,
					shop: 'hardware',
					quantity: 0,
					minThreshold
				}
			]);

			return { success: true, message: 'Product added successfully!' };
		} catch (err) {
			console.error('Error adding product:', err);
			if (err.message.includes('UNIQUE')) {
				return fail(400, { error: 'SKU already exists', success: false });
			}
			return fail(500, { error: err.message, success: false });
		}
	},

	adjustStock: async ({ request }) => {
		const formData = await request.formData();
		const inventoryId = parseInt(formData.get('inventoryId'));
		const adjustmentType = formData.get('adjustmentType');
		const quantity = parseInt(formData.get('quantity'));
		const reason = formData.get('reason') || null;

		// Validate inputs
		if (!inventoryId || !adjustmentType || !quantity || quantity <= 0) {
			return fail(400, { error: 'Invalid input data', success: false });
		}

		try {
			// Get current inventory record
			const [currentInventory] = await db
				.select()
				.from(inventory)
				.where(eq(inventory.id, inventoryId));

			if (!currentInventory) {
				return fail(404, { error: 'Inventory record not found', success: false });
			}

			// Calculate new quantity
			let newQuantity;
			if (adjustmentType === 'add') {
				newQuantity = currentInventory.quantity + quantity;
			} else if (adjustmentType === 'remove') {
				newQuantity = currentInventory.quantity - quantity;
				if (newQuantity < 0) {
					return fail(400, {
						error: 'Cannot remove more stock than available',
						success: false
					});
				}
			} else {
				return fail(400, { error: 'Invalid adjustment type', success: false });
			}

			// Update inventory
			await db
				.update(inventory)
				.set({
					quantity: newQuantity,
					lastUpdated: sql`(unixepoch())`
				})
				.where(eq(inventory.id, inventoryId));

			const action = adjustmentType === 'add' ? 'added to' : 'removed from';
			return {
				success: true,
				message: `Successfully ${action} stock! New quantity: ${newQuantity}`,
				adjustedId: inventoryId
			};
		} catch (err) {
			console.error('Error adjusting stock:', err);
			return fail(500, { error: err.message, success: false });
		}
	},

	deleteInventory: async ({ request }) => {
		const formData = await request.formData();
		const inventoryId = parseInt(formData.get('inventoryId'));

		if (!inventoryId) {
			return fail(400, { error: 'Invalid inventory ID', success: false });
		}

		try {
			await db.delete(inventory).where(eq(inventory.id, inventoryId));

			return {
				success: true,
				message: 'Inventory item deleted successfully!'
			};
		} catch (err) {
			console.error('Error deleting inventory:', err);
			return fail(500, { error: err.message, success: false });
		}
	},

	updateInventory: async ({ request }) => {
		const formData = await request.formData();
		const inventoryId = parseInt(formData.get('inventoryId'));
		const quantity = parseInt(formData.get('quantity'));
		const minThreshold = parseInt(formData.get('minThreshold'));

		// Validate inputs
		if (!inventoryId || isNaN(quantity) || isNaN(minThreshold) || quantity < 0 || minThreshold < 0) {
			return fail(400, { error: 'Invalid input data', success: false });
		}

		try {
			// Update inventory
			await db
				.update(inventory)
				.set({
					quantity,
					minThreshold,
					lastUpdated: sql`(unixepoch())`
				})
				.where(eq(inventory.id, inventoryId));

			return {
				success: true,
				message: 'Inventory updated successfully!'
			};
		} catch (err) {
			console.error('Error updating inventory:', err);
			return fail(500, { error: err.message, success: false });
		}
	}
};
