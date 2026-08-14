import { and, eq } from 'drizzle-orm';
import { db } from './client';
import { type NewTranslation, translations } from './schema';

export function translationQuery(songId: number, language: string) {
  return db
    .select()
    .from(translations)
    .where(and(eq(translations.songId, songId), eq(translations.language, language)));
}

export function translationsForSongQuery(songId: number) {
  return db.select().from(translations).where(eq(translations.songId, songId));
}

export async function saveTranslation(translation: Pick<NewTranslation, 'songId' | 'language' | 'lyrics'>) {
  const [row] = await db
    .insert(translations)
    .values(translation)
    .onConflictDoUpdate({
      target: [translations.songId, translations.language],
      set: { lyrics: translation.lyrics },
    })
    .returning();
  return row;
}
