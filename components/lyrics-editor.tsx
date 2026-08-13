import { countWords, splitIntoSlides } from '@/lib/lyrics';
import { ScrollView, Text, TextInput, View } from 'react-native';

export function LyricsEditor({
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
  const wordCount = countWords(value);
  const slides = splitIntoSlides(value);

  if (mode === 'preview') {
    return (
      <ScrollView className="flex-1" contentContainerClassName="gap-3.5 px-4 pb-8" showsVerticalScrollIndicator={false}>
        {slides.length === 0 ? (
          <View className="items-center rounded-lg border border-dashed border-border p-6">
            <Text className="text-center font-sora text-xs text-muted-foreground">
              Las diapositivas aparecerán aquí a medida que escribas.
            </Text>
          </View>
        ) : (
          slides.map((stanza, index) => (
            <View key={index} className="rounded-lg border border-border bg-card p-4">
              <Text className="text-center font-sora-semibold text-[15px] text-foreground">{stanza}</Text>
            </View>
          ))
        )}
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 overflow-hidden rounded-lg border border-border bg-card px-4" style={{ marginBottom: bottomInset }}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Escribe o pega la letra aquí..."
        placeholderTextColorClassName="accent-muted-foreground"
        multiline
        textAlignVertical="top"
        className="flex-1 py-4 font-sora text-sm text-foreground"
      />
      <View className="items-end border-t border-border py-2">
        <Text className="font-sora text-[11px] text-muted-foreground">{wordCount} palabras</Text>
      </View>
    </View>
  );
}
