import { asc, desc, eq, sql } from 'drizzle-orm';
import { resolveServiceLyrics } from '@/lib/lyrics';
import { db } from './client';
import { type NewSong, songs, translations } from './schema';

export function allSongsQuery() {
  return db.select().from(songs).orderBy(desc(songs.id));
}

// Ordered by the user's own drag-to-reorder position, not insertion —
// this is the queue as it'll be played, top to bottom.
export function serviceSongsQuery() {
  return db.select().from(songs).where(eq(songs.inService, true)).orderBy(asc(songs.serviceOrder), desc(songs.id));
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
  if (inService) {
    // New arrivals go to the back of the queue — one past the current
    // highest serviceOrder, so they don't jump ahead of songs already
    // placed by a prior drag-to-reorder.
    const [row] = await db
      .select({ max: sql<number | null>`max(${songs.serviceOrder})` })
      .from(songs)
      .where(eq(songs.inService, true));
    await db
      .update(songs)
      .set({ inService, serviceOrder: (row?.max ?? -1) + 1 })
      .where(eq(songs.id, id));
    return;
  }
  await db.update(songs).set({ inService }).where(eq(songs.id, id));
}

// Persists a full drag-to-reorder pass — `orderedIds` is the service
// queue's new top-to-bottom song id order. Each id's serviceOrder
// becomes its index, so a later addSong/setInService can keep appending
// after the highest existing value.
//
// One transaction, sequential writes — NOT Promise.all. That fired N
// unordered UPDATEs in parallel, each tripping the SQLite change
// listener useLiveQuery relies on, so the on-screen list re-rendered
// mid-batch with a partially-applied order (whichever writes happened
// to land first) before settling — visually the drag looked like it did
// nothing. A transaction commits all N writes as one change, so the
// live query only ever sees the final order.
export function reorderService(orderedIds: number[]) {
  db.transaction((tx) => {
    orderedIds.forEach((id, index) => {
      tx.update(songs).set({ serviceOrder: index }).where(eq(songs.id, id)).run();
    });
  });
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
  const existing = await db.select({ id: songs.id }).from(songs).where(sql`lower(${songs.title}) = lower(${song.title})`);
  if (existing.length > 0) return false;
  await db.insert(songs).values(song);
  return true;
}

// Full lyrics + translations for a batch of songs — what WorshipHub's
// `/songs/api/import-songs` actually wants (see this repo root's
// src/songs.rs). Chords never travel over this route: WorshipHub only
// ever projects lyrics, so there's nowhere for them to go even if we
// sent them.
//
// `serviceLanguages`/`serviceSlideOverrides` are the Service Slides
// screen's saved per-song language choices (hooks/use-app-settings.tsx's
// `service.languages`/`service.slideOverrides`) — when a song has one,
// its `lyrics` here is the RESOLVED text (see lib/lyrics.ts's
// resolveServiceLyrics), substituted directly into the field the
// backend actually persists. The Rust backend's `SongInput` only ever
// reads `lyrics`; there's no separate "resolved lyrics" field it
// understands, so overriding `lyrics` itself is the only way a chosen
// language actually reaches WorshipHub.
export async function getSongsForExport(
  ids: number[],
  serviceLanguages: Record<number, string> = {},
  serviceSlideOverrides: Record<number, Record<number, string>> = {}
) {
  const rows = await Promise.all(
    ids.map(async (id) => {
      const [song] = await db.select().from(songs).where(eq(songs.id, id));
      if (!song) return null;
      const songTranslations = await db.select().from(translations).where(eq(translations.songId, id));
      const globalLanguage = serviceLanguages[id] ?? song.language;
      const overrides = serviceSlideOverrides[id] ?? {};
      const resolved = resolveServiceLyrics(song, songTranslations, globalLanguage, overrides);
      return {
        title: song.title,
        artist: song.artist,
        language: song.language,
        lyrics: resolved ?? song.lyrics,
        translations: songTranslations.map((t) => ({ language: t.language, lyrics: t.lyrics })),
      };
    })
  );
  return rows.filter((row): row is NonNullable<typeof row> => row !== null);
}
