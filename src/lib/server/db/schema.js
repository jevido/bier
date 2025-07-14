import { pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const beers = pgTable('beers', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	link: text('link').notNull().unique(),
	img: text('img'),
	price: text('price'),
	attributes: jsonb('attributes'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});