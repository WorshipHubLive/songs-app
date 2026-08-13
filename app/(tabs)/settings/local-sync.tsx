import { AmbientGlow } from '@/components/ambient-glow';
import { QrScannerModal } from '@/components/qr-scanner-modal';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Stack } from 'expo-router';
import { QrCode, RefreshCw } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

// Mirrors Settings.tsx's Local Sync subTab — passing songs to ANOTHER
// instance of this app on the same network, unrelated to WorshipHub
// itself. Same honesty caveat as worshiphub.tsx: the address is saved
// locally (typed or scanned from the other device's QR), but there's no
// peer-discovery/sync networking built yet.
export default function LocalSyncScreen() {
  const colors = useThemeColors();
  const { settings, updateLocalSyncPeer } = useAppSettings();
  const [address, setAddress] = useState(settings.localSyncPeer.baseUrl ?? '');
  const [scannerVisible, setScannerVisible] = useState(false);

  const handleSave = (value: string) => {
    updateLocalSyncPeer({ baseUrl: value.trim() || null });
    Alert.alert(
      'Aún no disponible',
      'Guardamos la dirección, pero la sincronización local entre dispositivos todavía no está implementada en esta app.'
    );
  };

  const handleScanResult = (value: string) => {
    setScannerVisible(false);
    const base = value.replace(/\/+$/, '');
    setAddress(base);
    handleSave(base);
  };

  return (
    <View className="flex-1 bg-background">
      <AmbientGlow />
      <Stack.Title asChild>
        <Text className="font-sora-bold text-xl text-foreground">Sincronización local</Text>
      </Stack.Title>

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="gap-4 p-4">
        <Text className="font-sora text-xs leading-5 text-muted-foreground">
          Pasa canciones a OTRA instancia de WorshipHub Songs en tu misma red — nada que ver con WorshipHub (la app
          principal), solo entre copias de esta misma app.
        </Text>

        <View className="gap-3 rounded-md border border-border bg-card p-4">
          <Text className="font-sora-semibold text-sm text-foreground">Dirección del otro dispositivo</Text>

          <Pressable
            onPress={() => setScannerVisible(true)}
            className="flex-row items-center justify-center gap-1.5 rounded-md bg-secondary py-2.5"
          >
            <QrCode size={14} color={colors.secondaryForeground} />
            <Text className="font-sora-bold text-xs text-secondary-foreground">Escanear código QR</Text>
          </Pressable>

          <View className="flex-row items-center gap-2">
            <View className="h-px flex-1 bg-border" />
            <Text className="font-sora text-[10px] text-muted-foreground">o</Text>
            <View className="h-px flex-1 bg-border" />
          </View>

          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="192.168.1.42:8788"
            placeholderTextColorClassName="accent-muted-foreground"
            autoCapitalize="none"
            autoCorrect={false}
            className="rounded-md border border-input bg-background px-3 py-2.5 font-sora text-sm text-foreground"
          />
          <Pressable
            onPress={() => handleSave(address)}
            className="flex-row items-center justify-center gap-1.5 rounded-md bg-primary py-2.5"
          >
            <RefreshCw size={14} color={colors.primaryForeground} />
            <Text className="font-sora-bold text-xs text-primary-foreground">Guardar</Text>
          </Pressable>
        </View>
      </ScrollView>

      <QrScannerModal
        visible={scannerVisible}
        onResult={handleScanResult}
        onClose={() => setScannerVisible(false)}
        hint="Escanea el código de Sincronización Local del otro dispositivo."
      />
    </View>
  );
}
