import { fail, redirect } from '@sveltejs/kit';
import { createUser, createSession } from '$lib/server/auth.js';
import { db } from '$lib/server/db/index.js';
import { users } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

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
 * Signup action
 */
export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');
		const name = formData.get('name');

		// Validate input
		if (!email || !password || !confirmPassword || !name) {
			return fail(400, {
				error: 'All fields are required',
				email: email || '',
				name: name || ''
			});
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return fail(400, {
				error: 'Invalid email format',
				email,
				name
			});
		}

		// Validate password length
		if (password.length < 6) {
			return fail(400, {
				error: 'Password must be at least 6 characters',
				email,
				name
			});
		}

		// Validate password match
		if (password !== confirmPassword) {
			return fail(400, {
				error: 'Passwords do not match',
				email,
				name
			});
		}

		// Check if email already exists
		const [existingUser] = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (existingUser) {
			return fail(400, {
				error: 'Email already registered',
				email,
				name
			});
		}

		try {
			// Create user (regular user role by default)
			const newUser = await createUser(email, password, name, 'user');

			// Create session
			const { sessionId, expiresAt } = await createSession(newUser.id);

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
		} catch (error) {
			console.error('Signup error:', error);
			return fail(500, {
				error: 'Failed to create account. Please try again.',
				email,
				name
			});
		}
	}
};
