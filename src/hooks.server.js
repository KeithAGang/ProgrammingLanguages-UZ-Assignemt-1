import { seedDatabase } from '$lib/server/db/seed.js';
import { getUserFromSession } from '$lib/server/auth.js';

// Seed database on server startup (only runs if DB is empty)
seedDatabase();

/**
 * Handle hook - runs on every request
 * Extracts session and attaches user to event.locals
 */
export async function handle({ event, resolve }) {
	// Get session cookie
	const sessionId = event.cookies.get('session');

	// Get user from session
	if (sessionId) {
		event.locals.user = await getUserFromSession(sessionId);
	}

	// Continue with request
	return resolve(event);
}
