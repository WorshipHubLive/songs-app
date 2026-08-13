import { AmbientGlow } from '@/components/AmbientGlow';
import { fonts, radius, spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import SegmentedControl from '@expo/ui/community/segmented-control';
import { Stack, useRouter } from 'expo-router';
import { Music2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// This is the "new-song" native tab's own content (role="search", docked
// to the side of the tab bar) — NOT a pushed Stack screen, so it has no
// Stack ancestor to attach Stack.Title/Stack.Toolbar to. Its header is
// therefore custom-drawn, matching the rest of the app's visual language,
// with a close button that leaves the tab (there's no "back" — it's a
// tab, not a stack push) back to Songs. The tab bar itself hides while
// this tab is focused (see (tabs)/_layout.tsx's `hidden` prop) so it
// reads as a focused, full-screen editor rather than "one more tab".
export default function NewSongScreen() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [lang, setLang] = useState('es');

  const wordCount = lyrics.trim().length === 0 ? 0 : lyrics.trim().split(/\s+/).length;
  const stanzas = lyrics.split(/\n\s*\n/).filter((s) => s.trim().length > 0);

  // `navigate` (not `replace`/`push`) — this is a cross-tab jump inside
  // NativeTabs, not a same-stack history operation, and `replace` was
  // silently no-op-ing here (it targets the current navigator's own
  // history, but switching NativeTabs triggers isn't that).
  const close = () => router.navigate('/');

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <AmbientGlow />


      <Stack.Toolbar placement='left'>
        <Stack.Toolbar.Button icon="chevron.backward" onPress={() => router.back()} />
      </Stack.Toolbar>
      <Stack.Title asChild>
        <View style={{ flex: 1 }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Título de la canción"
            placeholderTextColor={theme.mutedForeground}
            style={[styles.titleInput, { color: theme.foreground }]}
          />
          <TextInput
            value={artist}
            onChangeText={setArtist}
            placeholder="Artista"
            placeholderTextColor={theme.mutedForeground}
            style={[styles.artistInput, { color: theme.mutedForeground }]}
          />
        </View>
      </Stack.Title>

      <Stack.Toolbar placement='right'>
        <Stack.Toolbar.Button icon="magnifyingglass" />
      </Stack.Toolbar>

      <Stack.Toolbar placement='bottom'>

        <Stack.Toolbar.View >
          <View style={{ width: 150 }}>
            <SegmentedControl
              values={['Lyric', 'Chords']}
              selectedIndex={mode === 'edit' ? 0 : 1}
              onChange={event => {
                setMode(event.nativeEvent.selectedSegmentIndex === 0 ? 'edit' : 'preview');
              }}
            />
          </View>
        </Stack.Toolbar.View>

        <Stack.Toolbar.Spacer />
        <Stack.Toolbar.Menu>
          <Stack.Toolbar.Label>🇪🇸 Español</Stack.Toolbar.Label>
          <Stack.Toolbar.MenuAction>
            🇪🇸 Español
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction>
            🇺🇸 English
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction>
            🇫🇷 Français
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction>
            🇹🇷 한국어
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>

      {/* <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 10,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <Pressable
          onPress={close}
          style={[styles.iconButton, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <ArrowLeft size={17} color={theme.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Título de la canción"
            placeholderTextColor={theme.mutedForeground}
            style={[styles.titleInput, { color: theme.foreground }]}
          />
          <TextInput
            value={artist}
            onChangeText={setArtist}
            placeholder="Artista"
            placeholderTextColor={theme.mutedForeground}
            style={[styles.artistInput, { color: theme.mutedForeground }]}
          />
        </View>
        <Pressable onPress={close} style={[styles.saveButton, { backgroundColor: theme.primary }]}>
          <Text style={[styles.saveText, { color: theme.primaryForeground }]}>Guardar</Text>
        </Pressable>
      </View> */}

      {/* <View style={styles.toolRow}>
        <Host
          matchContents
          seedColor={theme.primary}
          style={[styles.pickerHost, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <Picker selectedValue={lang} onValueChange={setLang} appearance="menu">
            <Picker.Item label="🇪🇸 Español" value="es" />
            <Picker.Item label="🇺🇸 English" value="en" />
            <Picker.Item label="🇫🇷 Français" value="fr" />
          </Picker>
        </Host>
        <Pressable style={[styles.searchPill, { borderColor: theme.border, backgroundColor: theme.card }]}>
          <Search size={13} color={theme.foreground} />
          <Text style={[styles.searchPillText, { color: theme.foreground }]}>
            Buscar letra en línea
          </Text>
        </Pressable>
      </View> */}

      <View style={{ paddingHorizontal: spacing.lg, marginTop: 120, marginBottom: 20 }}>
        <SegmentedControl
          values={['Editar', 'Vista previa']}
          selectedIndex={mode === 'edit' ? 0 : 1}
          onChange={event => {
            setMode(event.nativeEvent.selectedSegmentIndex === 0 ? 'edit' : 'preview');
          }}
        />
      </View>

      {mode === 'edit' ? (
        <View style={[styles.editorCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TextInput
            value={lyrics}
            onChangeText={setLyrics}
            placeholder="Escribe o pega la letra aquí..."
            placeholderTextColor={theme.mutedForeground}
            multiline
            style={[styles.textarea, { color: theme.foreground }]}
          />
          <View style={[styles.wordCountFooter, { borderTopColor: theme.border }]}>
            <Text style={[styles.wordCountText, { color: theme.mutedForeground }]}>
              {wordCount} palabras
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: insets.bottom + 40 }}
        >
          {stanzas.length === 0 ? (
            <View style={[styles.slidePlaceholder, { borderColor: theme.border }]}>
              <Text style={[styles.slidePlaceholderText, { color: theme.mutedForeground }]}>
                Las diapositivas aparecerán aquí a medida que escribas.
              </Text>
            </View>
          ) : (
            stanzas.map((s, i) => (
              <View key={i} style={[styles.slideCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.slideText, { color: theme.foreground }]}>{s}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

function SegTab({
  active,
  icon: Icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: typeof Music2;
  label: string;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.segTab, active && { backgroundColor: theme.primary }]}
    >
      <Icon size={14} color={active ? theme.primaryForeground : theme.mutedForeground} />
      <Text
        style={[
          styles.segTabLabel,
          { color: active ? theme.primaryForeground : theme.mutedForeground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleInput: { fontSize: 16, fontFamily: fonts.headingSemibold, padding: 0 },
  artistInput: { fontSize: 12, fontFamily: fonts.body, fontStyle: 'italic', padding: 0, marginTop: 2 },
  saveButton: { borderRadius: radius.full, paddingHorizontal: 16, height: 34, justifyContent: 'center' },
  saveText: { fontSize: 12, fontFamily: fonts.headingSemibold },
  toolRow: {

    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: 120,
  },
  pickerHost: { height: 34, borderRadius: radius.full, borderWidth: 1, justifyContent: 'center' },
  searchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    height: 34,
  },
  searchPillText: { fontSize: 11, fontFamily: fonts.headingSemibold },
  segmentedWrap: { alignItems: 'center', paddingVertical: spacing.md },
  segmented: { flexDirection: 'row', borderRadius: radius.md, borderWidth: 1, padding: 3, width: '90%' },
  segTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.sm + 4,
    paddingVertical: 8,
  },
  segTabLabel: { fontSize: 12, fontFamily: fonts.headingSemibold },
  editorCard: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  textarea: { flex: 1, padding: spacing.lg, fontSize: 14, fontFamily: fonts.body, textAlignVertical: 'top' },
  wordCountFooter: { borderTopWidth: StyleSheet.hairlineWidth, padding: spacing.sm, alignItems: 'flex-end' },
  wordCountText: { fontSize: 11, fontFamily: fonts.body },
  slidePlaceholder: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  slidePlaceholderText: { fontSize: 12, fontFamily: fonts.body, textAlign: 'center' },
  slideCard: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg },
  slideText: { fontSize: 15, fontFamily: fonts.headingSemibold, textAlign: 'center' },
});
