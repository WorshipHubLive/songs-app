import ArrowBackIcon from '@expo/material-symbols/arrow_back.xml';
import SaveIcon from '@expo/material-symbols/save.xml';
import { Picker } from '@expo/ui/community/picker';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LANGUAGES, languageFlagLabel } from '@/constants/languages';
import { songByIdQuery } from '@/db/songs-repository';
import { saveTranslation, translationQuery, translationsForSongQuery } from '@/db/translations-repository';

// A translation is a per-language copy of the lyrics, kept in its own
// `translations` row (unique on song + language) — the song's own
// `language`/`lyrics` columns are the original, untouched by this screen.
//
// Same toolbar shape as new-song/edit's language picker: a native
// Stack.Toolbar Menu on iOS, a custom footer Picker on Android (the
// native bottom toolbar doesn't render reliably there). Menu/picker
// labels get a trailing checkmark for languages that already have a
// saved translation, so switching languages doesn't lose track of
// progress without needing a separate badge UI.
export default function TranslateSongScreen() {
  const { songId: songIdParam } = useLocalSearchParams<{ songId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const songId = Number(songIdParam);
  const { bottom } = useSafeAreaInsets();

  const { data: songData } = useLiveQuery(songByIdQuery(songId));
  const song = songData?.[0];

  const availableLanguages = LANGUAGES.filter((l) => l.value !== song?.language);

  const { data: allTranslations } = useLiveQuery(translationsForSongQuery(songId));
  const translatedLanguages = new Set((allTranslations ?? []).map((t) => t.language));

  const [language, setLanguage] = useState('');
  useEffect(() => {
    if (!language && availableLanguages.length > 0) {
      setLanguage(availableLanguages[0].value);
    }
  }, [availableLanguages, language]);

  const { data: translationData } = useLiveQuery(translationQuery(songId, language), [songId, language]);
  const existing = translationData?.[0];

  const [lyrics, setLyrics] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLyrics(existing?.lyrics ?? '');
  }, [existing?.lyrics, language]);

  const close = () => router.back();

  const handleSave = async () => {
    if (!song || !language) return;
    setSaving(true);
    try {
      await saveTranslation({ songId: song.id, language, lyrics });
      close();
    } catch (error) {
      Alert.alert(t('songForm.saveFailedTitle'), String(error instanceof Error ? error.message : error));
    } finally {
      setSaving(false);
    }
  };

  const menuLabel = (value: string) => `${languageFlagLabel(value)}${translatedLanguages.has(value) ? ' ✓' : ''}`;

  return (
    <Fragment>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon={Platform.OS === 'ios' ? 'chevron.backward' : ArrowBackIcon}
          onPress={close}
          accessibilityLabel={t('common.back')}
        />
      </Stack.Toolbar>

      <Stack.Title asChild>
        <Text className="font-sora-semibold text-base text-foreground" numberOfLines={1}>
          {song ? t('translateSong.titlePrefix', { title: song.title }) : t('translateSong.titleGeneric')}
        </Text>
      </Stack.Title>

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={Platform.OS === 'ios' ? 'checkmark.circle' : SaveIcon}
          onPress={handleSave}
          disabled={saving || !language}
          accessibilityLabel={t('common.save')}
        />
      </Stack.Toolbar>

      {Platform.OS === 'ios' && (
        <Stack.Toolbar placement="bottom">
          <Stack.Toolbar.Spacer />
          <Stack.Toolbar.Menu title={language ? menuLabel(language) : t('translateSong.languageMenuPlaceholder')}>
            {availableLanguages.map((l) => (
              <Stack.Toolbar.MenuAction key={l.value} isOn={language === l.value} onPress={() => setLanguage(l.value)}>
                {menuLabel(l.value)}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
        </Stack.Toolbar>
      )}

      <View className={`flex-1 ${Platform.OS === 'ios' ? 'pt-32' : 'pt-4'}`}>
        <View className="flex-1 bg-background">
          <View className="flex-1 px-4">
            <View
              className="flex-1 overflow-hidden rounded-lg border border-border bg-card px-4"
              style={{ marginBottom: Platform.OS === 'ios' ? bottom + 16 : 16 }}
            >
              <TextInput
                value={lyrics}
                onChangeText={setLyrics}
                placeholder={t('translateSong.lyricsPlaceholder')}
                placeholderTextColorClassName="accent-muted-foreground"
                multiline
                textAlignVertical="top"
                className="flex-1 py-4 font-sora text-sm text-foreground"
              />
            </View>
          </View>
        </View>

        {Platform.OS === 'android' && (
          <View
            className="flex-row items-center justify-end border-t border-border bg-card px-4 pt-3"
            style={{ paddingBottom: bottom + 12 }}
          >
            <View className="w-48">
              <Picker selectedValue={language} onValueChange={setLanguage}>
                {availableLanguages.map((l) => (
                  <Picker.Item key={l.value} label={menuLabel(l.value)} value={l.value} />
                ))}
              </Picker>
            </View>
          </View>
        )}
      </View>
    </Fragment>
  );
}
