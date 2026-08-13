import { LyricsEditor } from '@/components/lyrics-editor';
import { LANGUAGES, languageFlagLabel } from '@/constants/languages';
import { songByIdQuery, updateSong } from '@/db/songs-repository';
import ArrowBackIcon from '@expo/material-symbols/arrow_back.xml';
import SaveIcon from '@expo/material-symbols/save.xml';
import { Picker } from '@expo/ui/community/picker';
import SegmentedControl from '@expo/ui/community/segmented-control';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment, useEffect, useState } from 'react';
import { Alert, Platform, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Same shape as new-song's editor (title/artist header, language toolbar,
// Editar/Vista previa body) but bound to an existing row. Chords aren't
// editable here (see new-song) — `chords` is only carried through
// unchanged on save so an existing value isn't wiped out.
export default function EditSongScreen() {
  const { songId: songIdParam } = useLocalSearchParams<{ songId: string }>();
  const router = useRouter();
  const songId = Number(songIdParam);
  const { bottom } = useSafeAreaInsets();

  const { data } = useLiveQuery(songByIdQuery(songId));
  const song = data?.[0];

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [chords, setChords] = useState('');
  const [lang, setLang] = useState('es');
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (song && !loaded) {
      setTitle(song.title);
      setArtist(song.artist);
      setLyrics(song.lyrics);
      setChords(song.chords);
      setLang(song.language);
      setLoaded(true);
    }
  }, [song, loaded]);

  const close = () => router.back();

  const handleSave = async () => {
    if (!song) return;
    if (!title.trim()) {
      Alert.alert('Falta el título', 'Escribe al menos el título de la canción para guardarla.');
      return;
    }
    setSaving(true);
    try {
      await updateSong(song.id, { title: title.trim(), artist: artist.trim(), lyrics, chords, language: lang });
      close();
    } catch (error) {
      Alert.alert('No se pudo guardar', String(error instanceof Error ? error.message : error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Fragment>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon={Platform.OS === 'ios' ? 'chevron.backward' : ArrowBackIcon} onPress={close} />
      </Stack.Toolbar>

      <Stack.Title asChild>
        <View className="flex-1">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Título de la canción"
            placeholderTextColorClassName="accent-muted-foreground"
            className="font-sora-semibold text-base text-foreground"
          />
          <TextInput
            value={artist}
            onChangeText={setArtist}
            placeholder="Artista"
            placeholderTextColorClassName="accent-muted-foreground"
            className="mt-0.5 font-sora text-xs italic text-muted-foreground"
          />
        </View>
      </Stack.Title>

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon={Platform.OS === 'ios' ? 'checkmark.circle' : SaveIcon} onPress={handleSave} disabled={saving} />
      </Stack.Toolbar>

      {Platform.OS === 'ios' && (
        <Stack.Toolbar placement="bottom">
          <Stack.Toolbar.Spacer />
          <Stack.Toolbar.Menu title={languageFlagLabel(lang)}>
            {LANGUAGES.map((language) => (
              <Stack.Toolbar.MenuAction key={language.value} isOn={lang === language.value} onPress={() => setLang(language.value)}>
                {`${language.flag} ${language.label}`}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
        </Stack.Toolbar>
      )}

      <View className={`flex-1 ${Platform.OS === 'ios' ? 'pt-32' : 'pt-4'} `}>
        <View className="flex-1 bg-background">
          <View className="flex-1 gap-y-4 px-4">
            <SegmentedControl
              values={['Editar', 'Vista previa']}
              selectedIndex={mode === 'edit' ? 0 : 1}
              onChange={(event) => setMode(event.nativeEvent.selectedSegmentIndex === 0 ? 'edit' : 'preview')}
              style={{ width: '100%' }}
            />

            <LyricsEditor value={lyrics} onChange={setLyrics} mode={mode} bottomInset={Platform.OS === 'ios' ? bottom + 60 : 20} />
          </View>
        </View>

        {Platform.OS === 'android' && (
          <View className="flex-row items-center justify-end border-t border-border bg-card px-4 py-3">
            <View className="w-40">
              <Picker selectedValue={lang} onValueChange={setLang}>
                {LANGUAGES.map((language) => (
                  <Picker.Item key={language.value} label={`${language.flag} ${language.label}`} value={language.value} />
                ))}
              </Picker>
            </View>
          </View>
        )}
      </View>
    </Fragment>
  );
}
