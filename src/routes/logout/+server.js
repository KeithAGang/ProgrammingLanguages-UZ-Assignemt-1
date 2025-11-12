import { redirect } from '@sveltejs/kit';
import { deleteSession } from '$lib/server/auth.js';

/**
 * POST /logout - Logout user and delete session
 */
export async function POST({ cookies, locals }) {
	// Get session cookie
	const sessionId = cookies.get('session');

	// Delete session from database
	if (sessionId) {
		await deleteSession(sessionId);
	}

	// Clear session cookie
	cookies.delete('session', { path: '/' });

	// Clear locals
	locals.user = null;

	// Redirect to login
	throw redirect(303, '/login');
}
