#!/usr/bin/env node

/**
 * Database Reset Script
 *
 * Drops all data from the database and re-seeds with default data
 *
 * Usage: node scripts/reset-db.js
 */

import { dropDatabase, seedDatabase } from '../src/lib/server/db/seed.js';

console.log('[RESET] Starting database reset...\n');

try {
	// Drop all data
	await dropDatabase();

	console.log('\n[SEED] Starting database seeding...\n');

	// Seed fresh data
	await seedDatabase();

	console.log('\n[SUCCESS] Database reset completed successfully!');
	console.log('\n[SUMMARY]');
	console.log('   - 60 products (30 groceries + 30 hardware)');
	console.log('   - 17 employees (8 grocery + 5 hardware + 4 runners)');
	console.log('   - 6 credit clients with sample transactions');
	console.log('\n[INFO] You can now start your development server with: npm run dev\n');

	process.exit(0);
} catch (error) {
	console.error('\n[ERROR] Error resetting database:', error);
	process.exit(1);
}
