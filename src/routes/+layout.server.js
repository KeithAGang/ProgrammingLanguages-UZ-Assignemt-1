/**
 * Root layout server - pass user data to all pages
 */
export async function load({ locals }) {
	return {
		user: locals.user
	};
}
