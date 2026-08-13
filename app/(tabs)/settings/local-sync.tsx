import { AmbientGlow } from '@/components/ambient-glow';
import { QrScannerModal } from '@/components/qr-scanner-modal';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { discoverSongsDesktopPeers, type DiscoveredPeer } from '@/lib/discovery';
import { Stack } from 'expo-router';
import { Laptop, QrCode, RefreshCw } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

// Mirrors Settings.tsx's Local Sync subTab — passing songs to ANOTHER
// instance of this app on the same network, unrelated to WorshipHub
// itself. The desktop app already advertises itself over mDNS for this
// exact purpose (see standalone/songs/src-tauri/src/server.rs,
// `_whsongs._tcp.local.`) — this screen just browses for that same
// announcement, nothing changes on the desktop side. Same honesty
// caveat as worshiphub.tsx: the address (found, scanned, or typed) is
// saved locally, but there's no peer-sync networking built yet.
export default function LocalSyncScreen() {
  const colors = useThemeColors();
  const { settings, updateLocalSyncPeer } = useAppSettings();
  const [address, setAddress] = useState(settings.localSyncPeer.baseUrl ?? '');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [peers, setPeers] = useState<DiscoveredPeer[]>([]);

  const handleSave = (value: string) => {
    updateLocalSyncPeer({ baseUrl: value.trim() || null });
    Alert.alert(
      'Aún no disponible',
      'Guardamos la dirección, pero la sincronización local entre dispositivos todavía no está implementada en esta app.'
    );
  };

  const handleDiscover = async () => {
    setScanning(true);
    try {
      const found = await discoverSongsDesktopPeers();
      setPeers(found);
    } finally {
      setScanning(false);
    }
  };

  const handleSelectPeer = (peer: DiscoveredPeer) => {
    const base = `${peer.ip}:${peer.port}`;
    setAddress(base);
    handleSave(base);
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
          <View className="flex-row items-center justify-between gap-3">
            <Text className="font-sora-semibold text-sm text-foreground">Encontrados en esta red</Text>
            <Pressable onPress={handleDiscover} disabled={scanning} className="flex-row items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
              {scanning ? <ActivityIndicator size="small" color={colors.primary} /> : <RefreshCw size={13} color={colors.primary} />}
              <Text className="font-sora-bold text-[11px] text-foreground">Buscar</Text>
            </Pressable>
          </View>

          {peers.length === 0 ? (
            <Text className="font-sora text-xs text-muted-foreground">
              {scanning ? 'Buscando…' : 'Toca "Buscar" para encontrar otra copia de la app en esta red.'}
            </Text>
          ) : (
            <View className="gap-2">
              {peers.map((peer) => (
                <Pressable
                  key={`${peer.ip}:${peer.port}`}
                  onPress={() => handleSelectPeer(peer)}
                  className="flex-row items-center gap-3 rounded-md border border-border px-3 py-2.5"
                >
                  <Laptop size={16} color={colors.mutedForeground} />
                  <Text className="min-w-0 flex-1 font-sora-semibold text-sm text-foreground" numberOfLines={1}>
                    {peer.name}
                  </Text>
                  <Text className="shrink-0 font-mono text-xs text-muted-foreground">{peer.ip}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View className="gap-3 rounded-md border border-border bg-card p-4">
          <Text className="font-sora-semibold text-sm text-foreground">O escribe la dirección</Text>

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
            placeholder="192.168.1.42:47822"
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
