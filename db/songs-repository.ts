import { db } from './client';
import { type NewSong, songs } from './schema';

export async function saveSong(song: Pick<NewSong, 'title' | 'artist' | 'lyrics' | 'language'>) {
  const [row] = await db.insert(songs).values(song).returning();
  return row;
}
