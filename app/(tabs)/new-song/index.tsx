import { AmbientGlow } from '@/components/ambient-glow';
import SegmentedControl from '@expo/ui/community/segmented-control';
import { Stack, useRouter } from 'expo-router';
import { Fragment, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LANGUAGES = [
  { value: 'es', label: '🇪🇸 Español' },
  { value: 'en', label: '🇺🇸 English' },
  { value: 'fr', label: '🇫🇷 Français' },
  { value: 'ko', label: '🇰🇷 한국어' },
];

// This is the "new-song" native tab's own content (role="search", docked
// to the side of the tab bar) — see (tabs)/_layout.tsx for why the tab
// bar hides while it's active, and its own _layout.tsx for why it still
// gets a native Stack header despite being a tab, not a pushed screen.
//
// Toolbar layout: left = back, title = editable title/artist, right =
// search-lyrics-online, bottom = Letra/Acordes segmented control +
// language menu. The Letra/Acordes split picks the content type; within
// Letra, a second (body-level) Editar/Vista previa control switches
// between the raw textarea and the slide preview.
export default function NewSongScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets()
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [content, setContent] = useState<'lyrics' | 'chords'>('lyrics');
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [lang, setLang] = useState('es');

  const wordCount = lyrics.trim().length === 0 ? 0 : lyrics.trim().split(/\s+/).length;
  const stanzas = lyrics.split(/\n\s*\n/).filter((s) => s.trim().length > 0);
  const currentLanguage = LANGUAGES.find((l) => l.value === lang)?.label ?? '';

  // `navigate` (not `replace`/`push`) — this is a cross-tab jump inside
  // NativeTabs, not a same-stack history operation; `replace` silently
  // no-ops here because it targets the current navigator's own history,
  // and switching NativeTabs triggers isn't that.
  const close = () => router.navigate('/');

  return (
    <Fragment>

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.backward" onPress={close} />
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
        <Stack.Toolbar.Button icon="magnifyingglass" onPress={() => { }} />
      </Stack.Toolbar>

      <Stack.Toolbar placement="bottom">
        <Stack.Toolbar.View>
          <View style={{ width: 150 }}>
            <SegmentedControl
              values={['Letra', 'Acordes']}
              selectedIndex={content === 'lyrics' ? 0 : 1}
              onChange={(event) => setContent(event.nativeEvent.selectedSegmentIndex === 0 ? 'lyrics' : 'chords')}
            />
          </View>
        </Stack.Toolbar.View>
        <Stack.Toolbar.Spacer />
        <Stack.Toolbar.Menu title={currentLanguage}>
          {LANGUAGES.map((language) => (
            <Stack.Toolbar.MenuAction key={language.value} isOn={lang === language.value} onPress={() => setLang(language.value)}>
              {language.label}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>

      <View className="flex-1 bg-background">
        <AmbientGlow />
        {content === 'chords' ? (
          <View className="flex-1 px-4 pt-4">
            <View className="rounded-xl border border-border bg-card p-6">
              <Text className="font-mono text-sm leading-[22px] text-muted-foreground">
                Am{'    '}F{'    '}C{'    '}G{'\n\n'}Editor de acordes (ChordPro)
              </Text>
            </View>
          </View>
        ) : (
          <View className="flex-1 px-4 pt-32 gap-y-4">
            <SegmentedControl
              values={['Editar', 'Vista previa']}
              selectedIndex={mode === 'edit' ? 0 : 1}
              onChange={(event) => setMode(event.nativeEvent.selectedSegmentIndex === 0 ? 'edit' : 'preview')}
              style={{ width: '100%' }}
            />

            {mode === 'edit' ? (
              <View className="flex-1 overflow-hidden rounded-lg border border-border bg-card" style={{ marginBottom: bottom + 60 }}>
                <TextInput
                  value={lyrics}
                  onChangeText={setLyrics}
                  placeholder="Escribe o pega la letra aquí..."
                  placeholderTextColorClassName="accent-muted-foreground"
                  multiline
                  textAlignVertical="top"
                  className="flex-1 p-4 font-sora text-sm text-foreground"
                />
                <View className="items-end border-t border-border p-2">
                  <Text className="font-sora text-[11px] text-muted-foreground">{wordCount} palabras</Text>
                </View>
              </View>
            ) : stanzas.length === 0 ? (
              <View className="items-center rounded-lg border border-dashed border-border p-6">
                <Text className="text-center font-sora text-xs text-muted-foreground">
                  Las diapositivas aparecerán aquí a medida que escribas.
                </Text>
              </View>
            ) : (
              stanzas.map((stanza, index) => (
                <View key={index} className="rounded-lg border border-border bg-card p-4">
                  <Text className="text-center font-sora-semibold text-[15px] text-foreground">{stanza}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </Fragment>
  );
}
