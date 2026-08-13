import { desc, eq, sql } from 'drizzle-orm';
import { db } from './client';
import { type NewSong, songs, translations } from './schema';

export function allSongsQuery() {
  return db.select().from(songs).orderBy(desc(songs.id));
}

export function serviceSongsQuery() {
  return db.select().from(songs).where(eq(songs.inService, true)).orderBy(desc(songs.id));
}

export function songByIdQuery(id: number) {
  return db.select().from(songs).where(eq(songs.id, id));
}

export async function saveSong(song: Pick<NewSong, 'title' | 'artist' | 'lyrics' | 'chords' | 'language'>) {
  const [row] = await db.insert(songs).values(song).returning();
  return row;
}

export async function updateSong(
  id: number,
  song: Partial<Pick<NewSong, 'title' | 'artist' | 'lyrics' | 'chords' | 'language'>>
) {
  const [row] = await db.update(songs).set(song).where(eq(songs.id, id)).returning();
  return row;
}

export async function setInService(id: number, inService: boolean) {
  await db.update(songs).set({ inService }).where(eq(songs.id, id));
}

export async function deleteSong(id: number) {
  await db.delete(translations).where(eq(translations.songId, id));
  await db.delete(songs).where(eq(songs.id, id));
}

// A peer (desktop Local Sync push) pushing songs in — matched by title,
// case-insensitively, same dedupe rule as the desktop's own
// `db::insert_if_missing` (src-tauri/src/db.rs). Existing songs are left
// untouched; only genuinely new titles get inserted.
export async function insertSongIfMissing(song: { title: string; artist: string; language: string; lyrics: string }) {
  const existing = await db
    .select({ id: songs.id })
    .from(songs)
    .where(sql`lower(${songs.title}) = lower(${song.title})`);
  if (existing.length > 0) return false;
  await db.insert(songs).values(song);
  return true;
}

// Full lyrics + translations for a batch of songs — what WorshipHub's
// `/songs/api/import-songs` actually wants (see this repo root's
// src/songs.rs). Chords never travel over this route: WorshipHub only
// ever projects lyrics, so there's nowhere for them to go even if we
// sent them.
export async function getSongsForExport(ids: number[]) {
  const rows = await Promise.all(
    ids.map(async (id) => {
      const [song] = await db.select().from(songs).where(eq(songs.id, id));
      if (!song) return null;
      const songTranslations = await db.select().from(translations).where(eq(translations.songId, id));
      return {
        title: song.title,
        artist: song.artist,
        language: song.language,
        lyrics: song.lyrics,
        translations: songTranslations.map((t) => ({ language: t.language, lyrics: t.lyrics })),
      };
    })
  );
  return rows.filter((row): row is NonNullable<typeof row> => row !== null);
}
