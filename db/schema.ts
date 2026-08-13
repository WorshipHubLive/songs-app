import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const songs = sqliteTable('songs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  artist: text('artist').notNull().default(''),
  lyrics: text('lyrics').notNull().default(''),
  language: text('language').notNull().default('es'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
});

export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;
