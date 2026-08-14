import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { parseChordPro } from '@/lib/chord-pro';

export function ChordProPreview({ chordPro }: { chordPro: string }) {
  const { t } = useTranslation();
  if (!chordPro.trim()) {
    return <Text className="font-sora text-sm italic text-muted-foreground">{t('chordProPreview.empty')}</Text>;
  }

  const lines = parseChordPro(chordPro);

  return (
    <View className="gap-1.5">
      {lines.map((line, li) => {
        if (line.isSectionMarker) {
          return (
            <View key={li} className="self-start rounded-md border border-primary/20 bg-primary/10 px-2.5 py-0.5">
              <Text className="font-sora-bold text-xs uppercase tracking-wider text-primary">{line.sectionTitle}</Text>
            </View>
          );
        }

        if (!line.hasChords && line.tokens.length === 1) {
          return (
            <Text key={li} className="font-mono text-sm text-foreground/80">
              {line.tokens[0].word || ' '}
            </Text>
          );
        }

        const isInstrumentalLine = line.hasChords && line.tokens.every((t) => !t.word.trim());
        if (isInstrumentalLine) {
          return (
            <View key={li} className="flex-row flex-wrap items-center gap-2 py-1">
              {line.tokens.map((token, ti) => (
                <View key={ti} className="rounded-md border border-secondary-foreground/10 bg-secondary px-2.5 py-1">
                  <Text className="font-mono text-xs font-bold text-secondary-foreground">{token.chord}</Text>
                </View>
              ))}
            </View>
          );
        }

        return (
          <View key={li} className="flex-row flex-wrap items-end">
            {line.tokens.map((token, ti) => (
              <View key={ti} className="items-start pr-1">
                <Text className={`font-mono text-xs font-bold leading-none ${token.chord ? 'text-primary' : 'text-transparent'}`}>
                  {token.chord || '·'}
                </Text>
                <Text className="font-mono text-sm leading-snug text-foreground">{token.word || ' '}</Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}
