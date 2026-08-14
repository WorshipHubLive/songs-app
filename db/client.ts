import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// `enableChangeListener` turns on SQLite's update hook — without it,
// `addDatabaseChangeListener` never fires, so drizzle's `useLiveQuery`
// (used across the songs/service screens) never learns a write happened
// and stays stale until the component remounts.
const expoDb = openDatabaseSync('songs.db', { enableChangeListener: true });

export const db = drizzle(expoDb, { schema });

// No drizzle-kit migrations yet — a single idempotent table creation is
// enough while the schema is this small; switch to real migrations once
// it grows past `songs`/`translations`.
expoDb.execSync(`
  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist TEXT NOT NULL DEFAULT '',
    lyrics TEXT NOT NULL DEFAULT '',
    chords TEXT NOT NULL DEFAULT '',
    language TEXT NOT NULL DEFAULT 'es',
    in_service INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (current_timestamp)
  );
  CREATE TABLE IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_id INTEGER NOT NULL,
    language TEXT NOT NULL,
    lyrics TEXT NOT NULL DEFAULT ''
  );
  CREATE UNIQUE INDEX IF NOT EXISTS translations_song_language_unique ON translations (song_id, language);
`);

// Devices with a `songs` table from before `chords`/`in_service` existed
// won't pick those up from CREATE TABLE IF NOT EXISTS — patch them in.
// SQLite has no "ADD COLUMN IF NOT EXISTS", so swallow the "duplicate
// column" error on databases that already have it.
for (const alter of [
  `ALTER TABLE songs ADD COLUMN chords TEXT NOT NULL DEFAULT '';`,
  `ALTER TABLE songs ADD COLUMN in_service INTEGER NOT NULL DEFAULT 0;`,
]) {
  try {
    expoDb.execSync(alter);
  } catch {
    // column already exists
  }
}
