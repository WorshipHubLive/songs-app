import { desc, eq } from 'drizzle-orm';
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
