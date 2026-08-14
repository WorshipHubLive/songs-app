import ArrowBackIcon from '@expo/material-symbols/arrow_back.xml';
import SaveIcon from '@expo/material-symbols/save.xml';
import SearchIcon from '@expo/material-symbols/search.xml';
import { Picker } from '@expo/ui/community/picker';
import SegmentedControl from '@expo/ui/community/segmented-control';
import { Stack, useRouter } from 'expo-router';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AmbientGlow } from '@/components/ambient-glow';
import { LyricsEditor } from '@/components/lyrics-editor';
import { SongSearchResultsModal } from '@/components/song-search-results-modal';
import { LANGUAGES, languageFlagLabel } from '@/constants/languages';
import { saveSong } from '@/db/songs-repository';
import { useAppSettings } from '@/hooks/use-app-settings';
import { type OnlineSearchResult, type StageSearchResult, searchByStage, searchOnlineHybrid } from '@/lib/online-search';

// This is the "new-song" native tab's own content (role="search", docked
// to the side of the tab bar) — see (tabs)/_layout.tsx for why the tab
// bar hides while it's active, and its own _layout.tsx for why it still
// gets a native Stack header despite being a tab, not a pushed screen.
//
// Toolbar layout: left = back, title = editable title/artist, right =
// search-lyrics-online + save, bottom = language menu. Chords aren't
// editable here yet (preview-only, see the song detail screen) — this
// screen is lyrics-only until that's built.
export default function NewSongScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const { settings } = useAppSettings();
  const tavilyApiKey = settings.search.tavilyApiKey;
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [lang, setLang] = useState('es');

  // `navigate` (not `replace`/`push`) — this is a cross-tab jump inside
  // NativeTabs, not a same-stack history operation; `replace` silently
  // no-ops here because it targets the current navigator's own history,
  // and switching NativeTabs triggers isn't that.
  const close = () => router.back();

  const [searchVisible, setSearchVisible] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchingMore, setSearchingMore] = useState(false);
  const [searchResult, setSearchResult] = useState<StageSearchResult | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSearch = async () => {
    if (!title.trim()) {
      Alert.alert(t('songForm.missingTitleTitle'), t('songForm.missingTitleToSearch'));
      return;
    }
    setSearchVisible(true);
    setSearching(true);
    try {
      const result = await searchOnlineHybrid(title, artist, tavilyApiKey);
      setSearchResult(result);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchMore = async () => {
    if (!searchResult?.nextStage) return;
    setSearchingMore(true);
    try {
      const result = await searchByStage(title, artist, searchResult.nextStage, tavilyApiKey);
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
      Alert.alert(t('songForm.missingTitleTitle'), t('songForm.missingTitleToSave'));
      return;
    }
    setSaving(true);
    try {
      await saveSong({ title: title.trim(), artist: artist.trim(), lyrics, chords: '', language: lang });
      close();
    } catch (error) {
      Alert.alert(t('songForm.saveFailedTitle'), String(error instanceof Error ? error.message : error));
    } finally {
      setSaving(false);
    }
  };

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
        <View className="flex-1">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('songForm.titlePlaceholder')}
            placeholderTextColorClassName="accent-muted-foreground"
            className="font-sora-semibold text-base text-foreground"
          />
          <TextInput
            value={artist}
            onChangeText={setArtist}
            placeholder={t('songForm.artistPlaceholder')}
            placeholderTextColorClassName="accent-muted-foreground"
            className="mt-0.5 font-sora text-xs italic text-muted-foreground"
          />
        </View>
      </Stack.Title>

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={Platform.OS === 'ios' ? 'magnifyingglass' : SearchIcon}
          onPress={handleSearch}
          disabled={searching}
          accessibilityLabel={t('songForm.searchOnline')}
        />
        <Stack.Toolbar.Button
          icon={Platform.OS === 'ios' ? 'checkmark.circle' : SaveIcon}
          onPress={handleSave}
          disabled={saving}
          accessibilityLabel={t('common.save')}
        />
      </Stack.Toolbar>

      {/* The native bottom toolbar only works reliably on iOS here — on
      Android it fails to render for this screen, so Android gets its own
      footer built in the page body instead (below). */}
      {Platform.OS === 'ios' && (
        <Stack.Toolbar placement="bottom">
          <Stack.Toolbar.Spacer />
          <Stack.Toolbar.Menu title={languageFlagLabel(lang)}>
            {LANGUAGES.map((language) => (
              <Stack.Toolbar.MenuAction
                key={language.value}
                isOn={lang === language.value}
                onPress={() => setLang(language.value)}
              >
                {`${language.flag} ${language.label}`}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
        </Stack.Toolbar>
      )}

      <View className={`flex-1 ${Platform.OS === 'ios' ? 'pt-32' : 'pt-4'} `}>
        <View className="flex-1 bg-background">
          <AmbientGlow />
          <View className="flex-1 gap-y-4 px-4">
            <SegmentedControl
              values={[t('songForm.modeEdit'), t('songForm.modePreview')]}
              selectedIndex={mode === 'edit' ? 0 : 1}
              onChange={(event) => setMode(event.nativeEvent.selectedSegmentIndex === 0 ? 'edit' : 'preview')}
              style={{ width: '100%' }}
            />

            <LyricsEditor
              value={lyrics}
              onChange={setLyrics}
              mode={mode}
              bottomInset={Platform.OS === 'ios' ? bottom + 60 : 20}
            />
          </View>
        </View>

        {Platform.OS === 'android' && (
          <View
            className="flex-row items-center justify-end border-t border-border bg-card px-4 pt-3"
            style={{ paddingBottom: bottom + 12 }}
          >
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

      <SongSearchResultsModal
        visible={searchVisible}
        loading={searching}
        results={searchResult?.results ?? []}
        nextStage={searchResult?.nextStage ?? null}
        searchingMore={searchingMore}
        onSelect={handleSelectResult}
        onSearchMore={handleSearchMore}
        onClose={() => setSearchVisible(false)}
      />
    </Fragment>
  );
}
