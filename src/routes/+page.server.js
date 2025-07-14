import { db } from '$lib/server/db/';
import { beers } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const load = async () => {
	// Fetch all beers from DB, newest first
	const allBeers = await db.select().from(beers).orderBy(desc(beers.createdAt));

	return { beers: allBeers };
};
