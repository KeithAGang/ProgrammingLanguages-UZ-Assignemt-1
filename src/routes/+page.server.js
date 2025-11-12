import { redirect } from '@sveltejs/kit';

/**
 * Root page - redirect to appropriate page based on auth status
 */
export async function load({ locals }) {
	if (locals.user) {
		throw redirect(303, '/dashboard');
	} else {
		throw redirect(303, '/login');
	}
}
