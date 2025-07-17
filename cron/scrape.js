// schedule: 6 6 * * 1

import { db, client } from './server/db/index';
import { beers } from './server/db/schema';
import { scrapeBeers } from './server/scraper';
import { eq } from 'drizzle-orm';

// Insert new beers if not present
// todo: i'm glad none else uses this site, if i read the performance issues with this
const scraped = await scrapeBeers();

for (const beer of scraped) {
	const existing = await db.select().from(beers).where(eq(beers.link, beer.link));
	if (!existing.length > 0) {
		await db.insert(beers).values({
			title: beer.title,
			link: beer.link,
			img: beer.img,
			price: beer.price,
			attributes: {}
		});
	}
}

await client.end();
