import { fail, redirect } from '@sveltejs/kit';
import { authenticateUser, createSession } from '$lib/server/auth.js';

/**
 * Load function - redirect if already logged in
 */
export async function load({ locals }) {
	if (locals.user) {
		throw redirect(303, '/dashboard');
	}
	return {};
}

/**
 * Login action
 */
export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		// Validate input
		if (!email || !password) {
			return fail(400, {
				error: 'Email and password are required',
				email: email || ''
			});
		}

		// Authenticate user
		const user = await authenticateUser(email, password);

		if (!user) {
			return fail(401, {
				error: 'Invalid email or password',
				email
			});
		}

		// Create session
		const { sessionId, expiresAt } = await createSession(user.id);

		// Set session cookie
		cookies.set('session', sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			expires: expiresAt
		});

		// Redirect to dashboard
		throw redirect(303, '/dashboard');
	}
};
