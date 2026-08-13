import { ChordProPreview } from '@/components/chord-pro-preview';
import { ScrollView, Text, TextInput, View } from 'react-native';

export function ChordsEditor({
  value,
  onChange,
  mode,
  bottomInset = 0,
}: {
  value: string;
  onChange: (v: string) => void;
  mode: 'edit' | 'preview';
  bottomInset?: number;
}) {
  if (mode === 'preview') {
    return (
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8" showsVerticalScrollIndicator={false}>
        <View className="rounded-xl border border-border bg-card p-4">
          <ChordProPreview chordPro={value} />
        </View>
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 overflow-hidden rounded-lg border border-border bg-card px-4" style={{ marginBottom: bottomInset }}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={'Formato ChordPro:\n\n[Intro]\n[C]/ [Am]/ [F]/ [G7]/\n\n[Verse 1]\n[C]Grande es tu [Am]fidelidad...'}
        placeholderTextColorClassName="accent-muted-foreground"
        multiline
        textAlignVertical="top"
        autoCapitalize="none"
        autoCorrect={false}
        className="flex-1 py-4 font-mono text-sm text-foreground"
      />
    </View>
  );
}
