/**
 * Standalone database client for scripts
 * (without SvelteKit environment dependencies)
 */

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';

const DATABASE_URL = process.env.DATABASE_URL || 'file:local.db';

const client = createClient({ url: DATABASE_URL });

export const db = drizzle(client, { schema });
