import ArrowBackIcon from '@expo/material-symbols/arrow_back.xml';
import { Host, Picker } from '@expo/ui';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, Text, View } from 'react-native';
import { AmbientGlow } from '@/components/ambient-glow';
import { languageFlagLabel } from '@/constants/languages';
import { songByIdQuery } from '@/db/songs-repository';
import { translationsForSongQuery } from '@/db/translations-repository';
import { useAppSettings } from '@/hooks/use-app-settings';
import { splitIntoSlides } from '@/lib/lyrics';

// Opened from the Service screen (a different route than Library's own
// song details, on purpose — this is a projection preview, not the
// edit/details view, mirrors standalone/songs' SongSlides.tsx) — shows
// the song split into slides the same way WorshipHub's running order
// does, with a language switcher for the whole song plus a per-slide
// override. Both choices are PERSISTED (hooks/use-app-settings.tsx's
// `service.languages`/`service.slideOverrides`, keyed by this song id)
// rather than local component state — they're what actually gets sent to
// WorshipHub when this song's turn comes (see
// send-to-worshiphub-sheet.tsx), not just a preview toggle that resets
// the moment you navigate away.
export default function SongSlidesScreen() {
  const { songId: songIdParam } = useLocalSearchParams<{ songId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const songId = Number(songIdParam);
  const { settings, setServiceSongLanguage, setServiceSlideOverride } = useAppSettings();

  const { data: songData } = useLiveQuery(songByIdQuery(songId));
  const song = songData?.[0];
  const { data: translations } = useLiveQuery(translationsForSongQuery(songId));

  // Every language's lyrics split into slides independently, then read
  // back by stanza index below — same "split each language, zip by
  // position" convention used when resolving what actually gets sent
  // (see lib/lyrics.ts's resolveServiceLyrics).
  const slidesByLanguage = useMemo(() => {
    if (!song) return {} as Record<string, string[]>;
    const map: Record<string, string[]> = { [song.language]: splitIntoSlides(song.lyrics) };
    for (const tr of translations ?? []) map[tr.language] = splitIntoSlides(tr.lyrics);
    return map;
  }, [song, translations]);

  const languages = useMemo(() => Object.keys(slidesByLanguage), [slidesByLanguage]);
  const slideCount = languages.reduce((max, lang) => Math.max(max, slidesByLanguage[lang]?.length ?? 0), 0);

  const globalLanguage = (song && settings.service.languages[songId]) || song?.language || '';
  const overrides = settings.service.slideOverrides[songId] ?? {};

  if (!song) {
    return (
      <View className="flex-1 bg-background">
        <AmbientGlow />
        <Stack.Toolbar placement="left">
          <Stack.Toolbar.Button
            icon={Platform.OS === 'ios' ? 'chevron.backward' : ArrowBackIcon}
            onPress={() => router.back()}
            accessibilityLabel={t('common.back')}
          />
        </Stack.Toolbar>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <AmbientGlow />

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon={Platform.OS === 'ios' ? 'chevron.backward' : ArrowBackIcon}
          onPress={() => router.back()}
          accessibilityLabel={t('common.back')}
        />
      </Stack.Toolbar>

      <Stack.Title asChild>
        <View className="w-full">
          <Text className="font-sora-semibold text-lg text-foreground" numberOfLines={1}>
            {song.title}
          </Text>
          <Text className="font-sora text-[10px] text-muted-foreground">{song.artist}</Text>
        </View>
      </Stack.Title>

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="gap-4 px-4 pb-10 pt-4">
        {languages.length > 1 && (
          <View className="flex-row items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <Text className="font-sora-extrabold text-[11px] tracking-widest text-muted-foreground/80 uppercase">
              {t('service.songLanguage')}
            </Text>
            <Host style={{ width: 160, height: 36 }}>
              <Picker selectedValue={globalLanguage} onValueChange={(v) => setServiceSongLanguage(songId, v)}>
                {languages.map((lang) => (
                  <Picker.Item key={lang} label={languageFlagLabel(lang)} value={lang} />
                ))}
              </Picker>
            </Host>
          </View>
        )}

        {slideCount === 0 ? (
          <Text className="py-16 text-center font-sora text-sm text-muted-foreground">{t('service.noSlides')}</Text>
        ) : (
          Array.from({ length: slideCount }, (_, i) => {
            const activeLang = overrides[i] ?? globalLanguage;
            const text = slidesByLanguage[activeLang]?.[i] ?? slidesByLanguage[song.language]?.[i] ?? '';
            return (
              <View key={i} className="gap-3 rounded-xl border border-border bg-card p-5">
                <View className="flex-row items-center justify-between gap-3">
                  <Text className="font-sora-extrabold text-[11px] tracking-widest text-muted-foreground/80 uppercase">
                    V{i + 1}
                  </Text>
                  {languages.length > 1 && (
                    <Host style={{ width: 130, height: 32 }}>
                      <Picker
                        selectedValue={overrides[i] ?? globalLanguage}
                        onValueChange={(v) => setServiceSlideOverride(songId, i, v === globalLanguage ? null : v)}
                      >
                        {languages.map((lang) => (
                          <Picker.Item key={lang} label={languageFlagLabel(lang)} value={lang} />
                        ))}
                      </Picker>
                    </Host>
                  )}
                </View>
                <Text className="font-sora-bold text-base leading-relaxed text-foreground">{text}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
