import { seedDatabase } from '$lib/server/db/seed.js';

// Seed database on server startup (only runs if DB is empty)
seedDatabase();
