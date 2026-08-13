import { AmbientGlow } from '@/components/ambient-glow';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Stack } from 'expo-router';
import { ExternalLink } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

// Mirrors Settings.tsx's Search subTab. The lyric search in new-song
// already works for free via LRCLIB + iTunes/lyrics.ovh (see
// lib/online-search.ts) — Tavily is only the optional 3rd fallback for
// songs those two miss.
export default function SearchSettingsScreen() {
  const colors = useThemeColors();
  const { settings, updateSearch } = useAppSettings();
  const [key, setKey] = useState(settings.search.tavilyApiKey);

  return (
    <View className="flex-1 bg-background">
      <AmbientGlow />
      <Stack.Title asChild>
        <Text className="font-sora-bold text-xl text-foreground">Búsqueda en línea</Text>
      </Stack.Title>

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="gap-4 p-4">
        <Text className="font-sora text-xs leading-5 text-muted-foreground">
          El botón de buscar en "Agregar canción" combina automáticamente LRCLIB e iTunes/lyrics.ovh para encontrar
          letras gratis. Si una canción no aparece ahí, puedes agregar una clave de Tavily como respaldo — el plan
          gratuito incluye 1000 búsquedas al mes.
        </Text>

        <View className="gap-1.5 rounded-md border border-border bg-card p-4">
          <Text className="font-sora-semibold text-xs uppercase tracking-wider text-muted-foreground">
            Clave de API de Tavily
          </Text>
          <TextInput
            value={key}
            onChangeText={setKey}
            onEndEditing={() => updateSearch({ tavilyApiKey: key.trim() })}
            placeholder="tvly-..."
            placeholderTextColorClassName="accent-muted-foreground"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            className="font-mono text-sm text-foreground"
          />
        </View>

        <Pressable onPress={() => Linking.openURL('https://app.tavily.com')} className="flex-row items-center gap-1.5 self-start">
          <Text className="font-sora-bold text-sm text-primary">Consigue tu clave gratis en Tavily</Text>
          <ExternalLink size={14} color={colors.primary} />
        </Pressable>
      </ScrollView>
    </View>
  );
}
