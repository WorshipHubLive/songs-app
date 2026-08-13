import { AmbientGlow } from '@/components/ambient-glow';
import { QrScannerModal } from '@/components/qr-scanner-modal';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Stack } from 'expo-router';
import { QrCode } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

// Mirrors Settings.tsx's Cloud subTab — a Supabase project URL + anon
// key so this library can sync across devices via the cloud instead of
// local network sync. Once a real Supabase client is wired up, this
// should sync transparently in the background — no "Sync Now" button or
// auto-sync toggle here, those imply manual control a real backend
// integration wouldn't need. Credentials can be typed or scanned from
// another already-configured device's QR code.
export default function CloudSyncScreen() {
  const colors = useThemeColors();
  const { settings, updateCloud } = useAppSettings();
  const [url, setUrl] = useState(settings.cloud.url);
  const [anonKey, setAnonKey] = useState(settings.cloud.anonKey);
  const [scannerVisible, setScannerVisible] = useState(false);

  const handleScanResult = (value: string) => {
    setScannerVisible(false);
    try {
      const parsed = JSON.parse(value) as { url?: string; anonKey?: string };
      if (!parsed.url || !parsed.anonKey) throw new Error('missing fields');
      setUrl(parsed.url);
      setAnonKey(parsed.anonKey);
      updateCloud({ url: parsed.url, anonKey: parsed.anonKey });
    } catch {
      Alert.alert('Código no reconocido', 'Este código QR no contiene credenciales de nube válidas.');
    }
  };

  return (
    <View className="flex-1 bg-background">
      <AmbientGlow />
      <Stack.Title asChild>
        <Text className="font-sora-bold text-xl text-foreground">Sincronización en la nube</Text>
      </Stack.Title>

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="gap-4 p-4">
        <Text className="font-sora text-xs leading-5 text-muted-foreground">
          Conecta un proyecto de Supabase para mantener tu biblioteca sincronizada entre todos tus dispositivos, sin
          depender de estar en la misma red.
        </Text>

        <Pressable
          onPress={() => setScannerVisible(true)}
          className="flex-row items-center justify-center gap-1.5 rounded-md bg-secondary py-2.5"
        >
          <QrCode size={14} color={colors.secondaryForeground} />
          <Text className="font-sora-bold text-xs text-secondary-foreground">Escanear código QR</Text>
        </Pressable>

        <View className="flex-row items-center gap-2">
          <View className="h-px flex-1 bg-border" />
          <Text className="font-sora text-[10px] text-muted-foreground">o escribe manualmente</Text>
          <View className="h-px flex-1 bg-border" />
        </View>

        <View className="gap-3 rounded-md border border-border bg-card p-4">
          <View className="gap-1.5">
            <Text className="font-sora-semibold text-xs uppercase tracking-wider text-muted-foreground">Project URL</Text>
            <TextInput
              value={url}
              onChangeText={setUrl}
              onEndEditing={() => updateCloud({ url: url.trim() })}
              placeholder="https://xxxxx.supabase.co"
              placeholderTextColorClassName="accent-muted-foreground"
              autoCapitalize="none"
              autoCorrect={false}
              className="font-mono text-sm text-foreground"
            />
          </View>
          <View className="gap-1.5 border-t border-border pt-3">
            <Text className="font-sora-semibold text-xs uppercase tracking-wider text-muted-foreground">Anon Key</Text>
            <TextInput
              value={anonKey}
              onChangeText={setAnonKey}
              onEndEditing={() => updateCloud({ anonKey: anonKey.trim() })}
              placeholder="eyJhbGciOi..."
              placeholderTextColorClassName="accent-muted-foreground"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              className="font-mono text-sm text-foreground"
            />
          </View>
        </View>

        {settings.cloud.lastSyncedAt ? (
          <Text className="text-center font-sora text-[11px] text-muted-foreground">
            Última sincronización: {settings.cloud.lastSyncedAt}
          </Text>
        ) : null}
      </ScrollView>

      <QrScannerModal
        visible={scannerVisible}
        onResult={handleScanResult}
        onClose={() => setScannerVisible(false)}
        hint="Escanea el código de Nube y Sincronización de otro dispositivo ya configurado."
      />
    </View>
  );
}
