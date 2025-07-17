import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// ? Client is exported, because you are supposed to close the connection manually in each process.
// ? Otherwise the process will stay open
export const client = postgres(process.env.DATABASE_URL);

export const db = drizzle(client, { schema });
