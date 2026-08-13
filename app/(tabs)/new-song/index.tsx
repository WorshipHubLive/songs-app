import { AmbientGlow } from '@/components/ambient-glow';
import { ChordsEditor } from '@/components/chords-editor';
import { LyricsEditor } from '@/components/lyrics-editor';
import { SongSearchResultsModal } from '@/components/song-search-results-modal';
import { saveSong } from '@/db/songs-repository';
import { type OnlineSearchResult, searchByStage, searchOnlineHybrid, type StageSearchResult } from '@/lib/online-search';
import ArrowBackIcon from '@expo/material-symbols/arrow_back.xml';
import SaveIcon from '@expo/material-symbols/save.xml';
import SearchIcon from '@expo/material-symbols/search.xml';
import { Picker, type PickerRef } from '@expo/ui/community/picker';
import SegmentedControl from '@expo/ui/community/segmented-control';
import { Stack, useRouter } from 'expo-router';
import { Fragment, useRef, useState } from 'react';
import { Alert, Platform, TextInput, View } from 'react-native';
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
  const [chords, setChords] = useState('');
  const [content, setContent] = useState<'lyrics' | 'chords'>('lyrics');
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [lang, setLang] = useState('es');

  const currentLanguage = LANGUAGES.find((l) => l.value === lang)?.label ?? '';

  // `navigate` (not `replace`/`push`) — this is a cross-tab jump inside
  // NativeTabs, not a same-stack history operation; `replace` silently
  // no-ops here because it targets the current navigator's own history,
  // and switching NativeTabs triggers isn't that.
  const close = () => router.navigate('/');

  const [language, setLanguage] = useState('java');
  const pickerRef = useRef<PickerRef>(null);

  const [searchVisible, setSearchVisible] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchingMore, setSearchingMore] = useState(false);
  const [searchResult, setSearchResult] = useState<StageSearchResult | null>(null);
  const [saving, setSaving] = useState(false);

  // Chords have no free source like LRCLIB/lyrics.ovh — the web app only
  // finds them via a paid Tavily search, and this app has no settings
  // screen to configure that key yet.
  const handleSearchChords = () => {
    Alert.alert(
      'Búsqueda de acordes no disponible',
      'Buscar acordes en línea requiere una clave de API (Tavily) que esta app todavía no permite configurar. Puedes escribirlos manualmente en formato ChordPro.'
    );
  };

  const handleSearch = async () => {
    if (content === 'chords') {
      handleSearchChords();
      return;
    }
    if (!title.trim()) {
      Alert.alert('Falta el título', 'Escribe al menos el título de la canción para buscarla.');
      return;
    }
    setSearchVisible(true);
    setSearching(true);
    try {
      const result = await searchOnlineHybrid(title, artist);
      setSearchResult(result);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchMore = async () => {
    if (!searchResult?.nextStage) return;
    setSearchingMore(true);
    try {
      const result = await searchByStage(title, artist, searchResult.nextStage);
      setSearchResult(result);
    } finally {
      setSearchingMore(false);
    }
  };

  const handleSelectResult = (result: OnlineSearchResult) => {
    setTitle(result.title);
    setArtist(result.artist);
    setLyrics(result.lyrics);
    setSearchVisible(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Falta el título', 'Escribe al menos el título de la canción para guardarla.');
      return;
    }
    setSaving(true);
    try {
      await saveSong({ title: title.trim(), artist: artist.trim(), lyrics, language: lang });
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
        <Stack.Toolbar.Button icon={Platform.OS === 'ios' ? 'magnifyingglass' : SearchIcon} onPress={handleSearch} disabled={searching} />
        <Stack.Toolbar.Button icon={Platform.OS === 'ios' ? 'checkmark.circle' : SaveIcon} onPress={handleSave} disabled={saving} />
      </Stack.Toolbar>

      {/* The native bottom toolbar only works reliably on iOS here — on
      Android it fails to render for this screen, so Android gets its own
      footer built in the page body instead (below). The language picker
      only makes sense for the lyrics tab — chords don't have a language. */}
      {Platform.OS === 'ios' && (
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
          {content === 'lyrics' && (
            <Stack.Toolbar.Menu title={currentLanguage}>
              {LANGUAGES.map((language) => (
                <Stack.Toolbar.MenuAction key={language.value} isOn={lang === language.value} onPress={() => setLang(language.value)}>
                  {language.label}
                </Stack.Toolbar.MenuAction>
              ))}
            </Stack.Toolbar.Menu>
          )}
        </Stack.Toolbar>
      )}

      <View className={`flex-1 ${Platform.OS === 'ios' ? 'pt-32' : 'pt-4'} `}>
        <View className="flex-1 bg-background">
          <AmbientGlow />
          <View className="flex-1 gap-y-4 px-4">
            <SegmentedControl
              values={['Editar', 'Vista previa']}
              selectedIndex={mode === 'edit' ? 0 : 1}
              onChange={(event) => setMode(event.nativeEvent.selectedSegmentIndex === 0 ? 'edit' : 'preview')}
              style={{ width: '100%' }}
            />

            {content === 'lyrics' ? (
              <LyricsEditor
                value={lyrics}
                onChange={setLyrics}
                mode={mode}
                bottomInset={Platform.OS === 'ios' ? bottom + 60 : 20}
              />
            ) : (
              <ChordsEditor
                value={chords}
                onChange={setChords}
                mode={mode}
                bottomInset={Platform.OS === 'ios' ? bottom + 60 : 20}
              />
            )}
          </View>
        </View>

        {Platform.OS === 'android' && (
          <View className="flex-row justify-between items-center gap-3 border-t border-border bg-card px-4 py-3">
            <View className="w-48">
              <SegmentedControl
                values={['Letra', 'Acordes']}
                selectedIndex={content === 'lyrics' ? 0 : 1}
                onChange={(event) => setContent(event.nativeEvent.selectedSegmentIndex === 0 ? 'lyrics' : 'chords')}
              />
            </View>
            {content === 'lyrics' && (
              <View className="w-30">
                <Picker selectedValue={lang} onValueChange={setLang}>
                  {LANGUAGES.map((language) => (
                    <Picker.Item key={language.value} label={language.label} value={language.value} />
                  ))}
                </Picker>
              </View>
            )}
          </View>
        )}
      </View>

      <SongSearchResultsModal
        visible={searchVisible}
        loading={searching}
        results={searchResult?.results ?? []}
        currentStage={searchResult?.currentStage ?? 1}
        nextStage={searchResult?.nextStage ?? null}
        searchingMore={searchingMore}
        onSelect={handleSelectResult}
        onSearchMore={handleSearchMore}
        onClose={() => setSearchVisible(false)}
      />
    </Fragment>
  );
}
