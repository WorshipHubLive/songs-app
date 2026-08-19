import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const songs = sqliteTable('songs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  artist: text('artist').notNull().default(''),
  lyrics: text('lyrics').notNull().default(''),
  chords: text('chords').notNull().default(''),
  language: text('language').notNull().default('es'),
  inService: integer('in_service', { mode: 'boolean' }).notNull().default(false),
  serviceOrder: integer('service_order').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
});

export const translations = sqliteTable(
  'translations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    songId: integer('song_id').notNull(),
    language: text('language').notNull(),
    lyrics: text('lyrics').notNull().default(''),
  },
  (table) => [uniqueIndex('translations_song_language_unique').on(table.songId, table.language)]
);

export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;
export type Translation = typeof translations.$inferSelect;
export type NewTranslation = typeof translations.$inferInsert;
