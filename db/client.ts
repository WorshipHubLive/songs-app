import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const expoDb = openDatabaseSync('songs.db');

export const db = drizzle(expoDb, { schema });

// No drizzle-kit migrations yet — a single idempotent table creation is
// enough while the schema is this small; switch to real migrations once
// it grows past `songs`.
expoDb.execSync(`
  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist TEXT NOT NULL DEFAULT '',
    lyrics TEXT NOT NULL DEFAULT '',
    language TEXT NOT NULL DEFAULT 'es',
    created_at TEXT NOT NULL DEFAULT (current_timestamp)
  );
`);
