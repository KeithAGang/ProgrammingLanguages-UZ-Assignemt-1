/**
 * Authentication Utilities
 *
 * Provides secure password hashing and session management
 * for the business automation system.
 */

import crypto from 'crypto';
import { users, sessions } from './db/schema.js';
import { eq } from 'drizzle-orm';

// Use standalone db client or regular one (for compatibility with scripts and SvelteKit)
let db;
try {
	const standalone = await import('./db/standalone.js');
	db = standalone.db;
} catch {
	const regular = await import('./db/index.js');
	db = regular.db;
}

// Session configuration
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Hash a password using PBKDF2
 */
export function hashPassword(password) {
	const salt = crypto.randomBytes(16).toString('hex');
	const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
	return `${salt}:${hash}`;
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password, storedHash) {
	const [salt, hash] = storedHash.split(':');
	const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
	return hash === verifyHash;
}

/**
 * Generate a secure random session ID
 */
export function generateSessionId() {
	return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new session for a user
 */
export async function createSession(userId) {
	const sessionId = generateSessionId();
	const expiresAt = new Date(Date.now() + SESSION_DURATION);

	await db.insert(sessions).values({
		id: sessionId,
		userId,
		expiresAt
	});

	return { sessionId, expiresAt };
}

/**
 * Get user from session ID
 */
export async function getUserFromSession(sessionId) {
	if (!sessionId) return null;

	const [session] = await db
		.select()
		.from(sessions)
		.where(eq(sessions.id, sessionId))
		.limit(1);

	if (!session) return null;

	// Check if session expired
	if (new Date(session.expiresAt) < new Date()) {
		await deleteSession(sessionId);
		return null;
	}

	// Get the user
	const [user] = await db
		.select({
			id: users.id,
			email: users.email,
			name: users.name,
			role: users.role
		})
		.from(users)
		.where(eq(users.id, session.userId))
		.limit(1);

	return user || null;
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(sessionId) {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

/**
 * Delete all expired sessions (cleanup)
 */
export async function deleteExpiredSessions() {
	const now = new Date();
	await db.delete(sessions).where(eq(sessions.expiresAt, now));
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(email, password) {
	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.email, email))
		.limit(1);

	if (!user) return null;

	const isValid = verifyPassword(password, user.passwordHash);
	if (!isValid) return null;

	return {
		id: user.id,
		email: user.email,
		name: user.name,
		role: user.role
	};
}

/**
 * Create a new user account
 */
export async function createUser(email, password, name, role = 'user') {
	const passwordHash = hashPassword(password);

	const [newUser] = await db
		.insert(users)
		.values({
			email,
			passwordHash,
			name,
			role
		})
		.returning({
			id: users.id,
			email: users.email,
			name: users.name,
			role: users.role
		});

	return newUser;
}
