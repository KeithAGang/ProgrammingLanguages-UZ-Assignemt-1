import { products, inventory, employees, credits, creditTransactions, sales, payroll, users, sessions } from './schema.js';
import { sql } from 'drizzle-orm';
import { hashPassword } from '../auth.js';

// Use standalone db client or regular one (for compatibility with scripts and SvelteKit)
let db;
try {
	const standalone = await import('./standalone.js');
	db = standalone.db;
} catch {
	const regular = await import('./index.js');
	db = regular.db;
}

const defaultGroceries = [
	{ name: 'Maize Meal 10kg', sku: 'GRO-001', category: 'grocery', unitPrice: 8.5 },
	{ name: 'Maize Meal 5kg', sku: 'GRO-002', category: 'grocery', unitPrice: 4.75 },
	{ name: 'Rice 10kg', sku: 'GRO-003', category: 'grocery', unitPrice: 18.0 },
	{ name: 'Rice 5kg', sku: 'GRO-004', category: 'grocery', unitPrice: 9.5 },
	{ name: 'Sugar 2kg', sku: 'GRO-005', category: 'grocery', unitPrice: 3.25 },
	{ name: 'Cooking Oil 2L', sku: 'GRO-006', category: 'grocery', unitPrice: 5.5 },
	{ name: 'Cooking Oil 5L', sku: 'GRO-007', category: 'grocery', unitPrice: 13.0 },
	{ name: 'Salt 1kg', sku: 'GRO-008', category: 'grocery', unitPrice: 0.85 },
	{ name: 'Flour 2kg', sku: 'GRO-009', category: 'grocery', unitPrice: 2.75 },
	{ name: 'Beans 2kg', sku: 'GRO-010', category: 'grocery', unitPrice: 4.5 },
	{ name: 'Samp 2kg', sku: 'GRO-011', category: 'grocery', unitPrice: 3.25 },
	{ name: 'Pasta 500g', sku: 'GRO-012', category: 'grocery', unitPrice: 1.5 },
	{ name: 'Tomato Sauce 700ml', sku: 'GRO-013', category: 'grocery', unitPrice: 2.25 },
	{ name: 'Peanut Butter 400g', sku: 'GRO-014', category: 'grocery', unitPrice: 3.75 },
	{ name: 'Margarine 500g', sku: 'GRO-015', category: 'grocery', unitPrice: 2.5 },
	{ name: 'Tea Bags 100s', sku: 'GRO-016', category: 'grocery', unitPrice: 2.85 },
	{ name: 'Coffee 200g', sku: 'GRO-017', category: 'grocery', unitPrice: 4.25 },
	{ name: 'Milk Powder 500g', sku: 'GRO-018', category: 'grocery', unitPrice: 4.5 },
	{ name: 'Bread Loaf', sku: 'GRO-019', category: 'grocery', unitPrice: 0.95 },
	{ name: 'Eggs (Tray 30)', sku: 'GRO-020', category: 'grocery', unitPrice: 6.5 },
	{ name: 'Chicken Pieces 2kg', sku: 'GRO-021', category: 'grocery', unitPrice: 7.5 },
	{ name: 'Beef Mince 1kg', sku: 'GRO-022', category: 'grocery', unitPrice: 6.75 },
	{ name: 'Washing Powder 2kg', sku: 'GRO-023', category: 'grocery', unitPrice: 5.25 },
	{ name: 'Soap Bar 5-pack', sku: 'GRO-024', category: 'grocery', unitPrice: 3.0 },
	{ name: 'Toilet Paper 9-pack', sku: 'GRO-025', category: 'grocery', unitPrice: 4.5 },
	{ name: 'Dishwashing Liquid 750ml', sku: 'GRO-026', category: 'grocery', unitPrice: 2.25 },
	{ name: 'Candles 12-pack', sku: 'GRO-027', category: 'grocery', unitPrice: 3.5 },
	{ name: 'Matches Box of 10', sku: 'GRO-028', category: 'grocery', unitPrice: 1.25 },
	{ name: 'Airtime Voucher $5', sku: 'GRO-029', category: 'grocery', unitPrice: 5.0 },
	{ name: 'Airtime Voucher $10', sku: 'GRO-030', category: 'grocery', unitPrice: 10.0 }
];

const defaultHardware = [
	{ name: 'Engine Oil 20W-50 5L', sku: 'HW-001', category: 'spare-parts', unitPrice: 24.0 },
	{ name: 'Engine Oil 10W-40 4L', sku: 'HW-002', category: 'spare-parts', unitPrice: 18.5 },
	{ name: 'Diesel Engine Oil 15W-40 5L', sku: 'HW-003', category: 'spare-parts', unitPrice: 26.0 },
	{ name: 'Oil Filter Toyota', sku: 'HW-004', category: 'spare-parts', unitPrice: 6.5 },
	{ name: 'Oil Filter Nissan', sku: 'HW-005', category: 'spare-parts', unitPrice: 6.75 },
	{ name: 'Air Filter Toyota', sku: 'HW-006', category: 'spare-parts', unitPrice: 8.5 },
	{ name: 'Air Filter Honda', sku: 'HW-007', category: 'spare-parts', unitPrice: 9.0 },
	{ name: 'Spark Plugs (Set of 4)', sku: 'HW-008', category: 'spare-parts', unitPrice: 12.0 },
	{ name: 'Brake Pads Front Toyota', sku: 'HW-009', category: 'spare-parts', unitPrice: 35.0 },
	{ name: 'Brake Pads Rear Toyota', sku: 'HW-010', category: 'spare-parts', unitPrice: 28.0 },
	{ name: 'Brake Pads Front Nissan', sku: 'HW-011', category: 'spare-parts', unitPrice: 38.0 },
	{ name: 'Brake Shoes Set', sku: 'HW-012', category: 'spare-parts', unitPrice: 22.0 },
	{ name: 'Wiper Blades Universal', sku: 'HW-013', category: 'spare-parts', unitPrice: 8.5 },
	{ name: 'Car Battery 12V 70Ah', sku: 'HW-014', category: 'spare-parts', unitPrice: 85.0 },
	{ name: 'Car Battery 12V 100Ah', sku: 'HW-015', category: 'spare-parts', unitPrice: 115.0 },
	{ name: 'Coolant 5L Green', sku: 'HW-016', category: 'spare-parts', unitPrice: 12.5 },
	{ name: 'Brake Fluid DOT3 500ml', sku: 'HW-017', category: 'spare-parts', unitPrice: 4.5 },
	{ name: 'Brake Fluid DOT4 500ml', sku: 'HW-018', category: 'spare-parts', unitPrice: 5.25 },
	{ name: 'Gear Oil 90 1L', sku: 'HW-019', category: 'spare-parts', unitPrice: 7.5 },
	{ name: 'Transmission Oil ATF 1L', sku: 'HW-020', category: 'spare-parts', unitPrice: 9.0 },
	{ name: 'Fan Belt Toyota', sku: 'HW-021', category: 'spare-parts', unitPrice: 6.5 },
	{ name: 'Timing Belt Kit', sku: 'HW-022', category: 'spare-parts', unitPrice: 45.0 },
	{ name: 'Headlight Bulb H4', sku: 'HW-023', category: 'spare-parts', unitPrice: 5.5 },
	{ name: 'Headlight Bulb H7', sku: 'HW-024', category: 'spare-parts', unitPrice: 6.0 },
	{ name: 'Indicator Bulb Pair', sku: 'HW-025', category: 'spare-parts', unitPrice: 3.0 },
	{ name: 'Fuse Set 10-pack', sku: 'HW-026', category: 'spare-parts', unitPrice: 4.5 },
	{ name: 'Tire Puncture Repair Kit', sku: 'HW-027', category: 'spare-parts', unitPrice: 8.5 },
	{ name: 'Radiator Hose Upper', sku: 'HW-028', category: 'spare-parts', unitPrice: 12.0 },
	{ name: 'Radiator Hose Lower', sku: 'HW-029', category: 'spare-parts', unitPrice: 11.5 },
	{ name: 'Clutch Plate Set', sku: 'HW-030', category: 'spare-parts', unitPrice: 95.0 }
];

const defaultEmployees = [
	// Grocery shop employees (Zimbabwean names)
	{ name: 'Tendai Moyo', employeeType: 'full-time', shop: 'grocery', baseSalary: 350, dailyRate: null, qualifications: 'Shop Manager, 5 years experience' },
	{ name: 'Tatenda Ncube', employeeType: 'full-time', shop: 'grocery', baseSalary: 250, dailyRate: null, qualifications: 'Cashier' },
	{ name: 'Blessing Chikwamba', employeeType: 'full-time', shop: 'grocery', baseSalary: 220, dailyRate: null, qualifications: 'Sales Assistant' },
	{ name: 'Rudo Mpofu', employeeType: 'full-time', shop: 'grocery', baseSalary: 220, dailyRate: null, qualifications: 'Sales Assistant' },
	{ name: 'Farai Sibanda', employeeType: 'full-time', shop: 'grocery', baseSalary: 230, dailyRate: null, qualifications: 'Stock Controller' },
	{ name: 'Kudzai Dube', employeeType: 'full-time', shop: 'grocery', baseSalary: 210, dailyRate: null, qualifications: 'General Worker' },
	{ name: 'Tariro Nyathi', employeeType: 'full-time', shop: 'grocery', baseSalary: 210, dailyRate: null, qualifications: 'General Worker' },
	{ name: 'Chipo Mapfumo', employeeType: 'full-time', shop: 'grocery', baseSalary: 240, dailyRate: null, qualifications: 'Cashier, 3 years experience' },

	// Hardware shop employees (South African names)
	{ name: 'Thabo Nkosi', employeeType: 'full-time', shop: 'hardware', baseSalary: 400, dailyRate: null, qualifications: 'Mechanic, 8 years experience' },
	{ name: 'Sipho Dlamini', employeeType: 'full-time', shop: 'hardware', baseSalary: 320, dailyRate: null, qualifications: 'Parts Specialist' },
	{ name: 'Mandla Khumalo', employeeType: 'full-time', shop: 'hardware', baseSalary: 280, dailyRate: null, qualifications: 'Sales Assistant' },
	{ name: 'Zanele Mthembu', employeeType: 'full-time', shop: 'hardware', baseSalary: 260, dailyRate: null, qualifications: 'Cashier' },
	{ name: 'Bongani Zulu', employeeType: 'full-time', shop: 'hardware', baseSalary: 270, dailyRate: null, qualifications: 'Stock Controller' },

	// Runners (both shops)
	{ name: 'Takudzwa Makoni', employeeType: 'runner', shop: 'both', baseSalary: null, dailyRate: 15.0, qualifications: 'Delivery Runner' },
	{ name: 'Simba Gumbo', employeeType: 'runner', shop: 'both', baseSalary: null, dailyRate: 15.0, qualifications: 'Delivery Runner' },
	{ name: 'Lucky Moyo', employeeType: 'runner', shop: 'grocery', baseSalary: null, dailyRate: 12.0, qualifications: 'General Helper' },
	{ name: 'Justice Ndlovu', employeeType: 'runner', shop: 'hardware', baseSalary: null, dailyRate: 18.0, qualifications: 'Mechanic Assistant' }
];

const defaultCreditClients = [
	{ clientName: "Joe's Auto Repair", clientType: 'garage', totalOwed: 0 },
	{ clientName: 'Mbare Motors', clientType: 'garage', totalOwed: 0 },
	{ clientName: 'Avondale Car Service', clientType: 'garage', totalOwed: 0 },
	{ clientName: 'Highway Garage', clientType: 'garage', totalOwed: 0 },
	{ clientName: 'Southerton Auto Spares', clientType: 'garage', totalOwed: 0 },
	{ clientName: 'CBD Quick Fix', clientType: 'garage', totalOwed: 0 }
];

/**
 * Seed database with default data
 */
export async function seedDatabase() {
	try {
		// Check if products already exist
		const existingProducts = await db.select().from(products);

		if (existingProducts.length > 0) {
			console.log('Database already seeded. Skipping seed process.');
			return;
		}

		console.log('Seeding database with default data...');

		// 1. Insert all products
		const allProducts = [...defaultGroceries, ...defaultHardware];
		for (const product of allProducts) {
			const [newProduct] = await db.insert(products).values(product).returning();

			// Create inventory entry only for the appropriate shop
			if (product.category === 'grocery') {
				// Grocery items go to grocery shop only
				await db.insert(inventory).values({
					productId: newProduct.id,
					shop: 'grocery',
					quantity: 100,
					minThreshold: 20
				});
			} else if (product.category === 'spare-parts') {
				// Hardware items go to hardware shop only
				await db.insert(inventory).values({
					productId: newProduct.id,
					shop: 'hardware',
					quantity: 50,
					minThreshold: 10
				});
			}
		}

		console.log(`[OK] Seeded ${allProducts.length} products (${defaultGroceries.length} groceries, ${defaultHardware.length} hardware)`);

		// 2. Insert employees
		for (const employee of defaultEmployees) {
			await db.insert(employees).values(employee);
		}

		console.log(`[OK] Seeded ${defaultEmployees.length} employees`);

		// 3. Insert credit clients and sample transactions
		for (const client of defaultCreditClients) {
			const [newClient] = await db.insert(credits).values(client).returning();

			// Create some sample credit transactions
			const transactionSamples = [
				{ type: 'debit', amount: Math.floor(Math.random() * 200) + 50, description: 'Engine oil and filters' },
				{ type: 'debit', amount: Math.floor(Math.random() * 150) + 30, description: 'Brake pads' },
				{ type: 'payment', amount: Math.floor(Math.random() * 100) + 50, description: 'Partial payment' }
			];

			let runningBalance = 0;
			for (const txn of transactionSamples) {
				// Set due date 7 days from now for debits
				const dueDate = txn.type === 'debit'
					? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
					: null;

				await db.insert(creditTransactions).values({
					creditId: newClient.id,
					type: txn.type,
					amount: txn.amount,
					description: txn.description,
					dueDate
				});

				runningBalance += txn.type === 'debit' ? txn.amount : -txn.amount;
			}

			// Update client's total owed
			await db
				.update(credits)
				.set({ totalOwed: Math.max(0, runningBalance) })
				.where(sql`id = ${newClient.id}`);
		}

		console.log(`[OK] Seeded ${defaultCreditClients.length} credit clients with sample transactions`);

		// 4. Create default admin account
		const existingUsers = await db.select().from(users);

		if (existingUsers.length === 0) {
			const defaultPassword = 'admin123';
			const passwordHash = hashPassword(defaultPassword);

			await db.insert(users).values({
				email: 'admin@business.com',
				passwordHash,
				name: 'Admin User',
				role: 'admin'
			});

			console.log('[OK] Created default admin account');
			console.log('    Email: admin@business.com');
			console.log('    Password: admin123');
			console.log('    IMPORTANT: Change this password after first login!');
		}

		console.log('[SUCCESS] Database seeding completed successfully!');
	} catch (error) {
		console.error('[ERROR] Error seeding database:', error);
	}
}

/**
 * Drop all data from database
 */
export async function dropDatabase() {
	try {
		console.log('Dropping all database tables...');

		await db.delete(sessions);
		await db.delete(users);
		await db.delete(creditTransactions);
		await db.delete(credits);
		await db.delete(payroll);
		await db.delete(employees);
		await db.delete(sales);
		await db.delete(inventory);
		await db.delete(products);

		console.log('[SUCCESS] Database tables cleared successfully!');
	} catch (error) {
		console.error('[ERROR] Error dropping database:', error);
	}
}
