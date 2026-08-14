import { Stack } from 'expo-router';
import { Laptop, QrCode, RefreshCw, Zap } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { AmbientGlow } from '@/components/ambient-glow';
import { QrScannerModal } from '@/components/qr-scanner-modal';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { type DiscoveredPeer, discoverWorshipHub } from '@/lib/discovery';

// Mirrors Settings.tsx's WorshipHub subTab: link status, mDNS-discovered
// instances on this network, or a manual/QR-scanned address. WorshipHub
// already advertises itself over mDNS for the desktop app to browse (see
// ScreenWorship's src/local_server.rs, `_worshiphub._tcp.local.`) — this
// screen just adds a second browser for that same announcement, nothing
// changes on WorshipHub's side. The web/desktop app pairs for real once
// found; this native build doesn't have that pairing handshake wired up
// yet, so "Conectar" is honest about that rather than faking a
// connection — the address is still saved for whenever it is.
export default function WorshipHubScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { settings, updateWorshipHub } = useAppSettings();
  const [address, setAddress] = useState(settings.worshiphub.baseUrl ?? '');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [peers, setPeers] = useState<DiscoveredPeer[]>([]);
  const { linked } = settings.worshiphub;

  const handleConnect = (value: string) => {
    if (!value.trim()) return;
    updateWorshipHub({ baseUrl: value.trim() });
    Alert.alert(t('worshiphubScreen.notAvailableTitle'), t('worshiphubScreen.notAvailableMessage'));
  };

  const handleDiscover = async () => {
    setScanning(true);
    try {
      const found = await discoverWorshipHub();
      setPeers(found);
    } finally {
      setScanning(false);
    }
  };

  const handleSelectPeer = (peer: DiscoveredPeer) => {
    const base = `https://${peer.ip}:${peer.port}`;
    setAddress(base);
    handleConnect(base);
  };

  const handleScanResult = (value: string) => {
    setScannerVisible(false);
    // Same normalization as the web scanner: WorshipHub's QR encodes its
    // pairing endpoint, strip that suffix down to a bare address.
    const base = value.replace(/\/remote\/ws\/?$/i, '').replace(/\/+$/, '');
    setAddress(base);
    handleConnect(base);
  };

  const handleDisconnect = () => {
    updateWorshipHub({ linked: false, baseUrl: null, name: '' });
  };

  return (
    <View className="flex-1 bg-background">
      <AmbientGlow />
      <Stack.Title asChild>
        <Text className="font-sora-bold text-xl text-foreground">{t('worshiphubScreen.title')}</Text>
      </Stack.Title>

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="gap-4 p-4">
        <Text className="font-sora text-xs leading-5 text-muted-foreground">{t('worshiphubScreen.description')}</Text>

        <View className="flex-row items-center justify-between gap-3 rounded-md border border-border bg-card p-4">
          <View className="min-w-0 flex-1">
            <Text className="font-sora-semibold text-sm text-foreground">
              {linked ? t('worshiphubScreen.linked') : t('worshiphubScreen.notLinked')}
            </Text>
            {linked && settings.worshiphub.baseUrl && (
              <Text className="mt-0.5 font-mono text-xs text-muted-foreground" numberOfLines={1}>
                {settings.worshiphub.baseUrl}
              </Text>
            )}
          </View>
          <View className={`flex-row items-center gap-1.5 rounded-full px-3 py-1 ${linked ? 'bg-primary/15' : 'bg-muted'}`}>
            <View className={`h-1.5 w-1.5 rounded-full ${linked ? 'bg-primary' : 'bg-muted-foreground/50'}`} />
            <Text className={`font-sora-bold text-[11px] ${linked ? 'text-primary' : 'text-muted-foreground'}`}>
              {linked ? t('worshiphubScreen.connected') : t('worshiphubScreen.disconnected')}
            </Text>
          </View>
        </View>

        {linked && (
          <Pressable onPress={handleDisconnect} className="items-center self-start rounded-md border border-border px-4 py-2">
            <Text className="font-sora-bold text-xs text-foreground">{t('worshiphubScreen.disconnect')}</Text>
          </Pressable>
        )}

        <View className="gap-3 rounded-md border border-border bg-card p-4">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="font-sora-semibold text-sm text-foreground">{t('worshiphubScreen.foundLabel')}</Text>
            <Pressable
              onPress={handleDiscover}
              disabled={scanning}
              className="flex-row items-center gap-1.5 rounded-full border border-border px-3 py-1.5"
            >
              {scanning ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <RefreshCw size={13} color={colors.primary} />
              )}
              <Text className="font-sora-bold text-[11px] text-foreground">{t('common.search')}</Text>
            </Pressable>
          </View>

          {peers.length === 0 ? (
            <Text className="font-sora text-xs text-muted-foreground">
              {scanning ? t('worshiphubScreen.searching') : t('worshiphubScreen.emptyHint')}
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
          <Text className="font-sora-semibold text-sm text-foreground">{t('worshiphubScreen.typeAddress')}</Text>

          <Pressable
            onPress={() => setScannerVisible(true)}
            className="flex-row items-center justify-center gap-1.5 rounded-md bg-secondary py-2.5"
          >
            <QrCode size={14} color={colors.secondaryForeground} />
            <Text className="font-sora-bold text-xs text-secondary-foreground">{t('common.scanQrCode')}</Text>
          </Pressable>

          <View className="flex-row items-center gap-2">
            <View className="h-px flex-1 bg-border" />
            <Text className="font-sora text-[10px] text-muted-foreground">{t('common.or')}</Text>
            <View className="h-px flex-1 bg-border" />
          </View>

          <View className="flex-row gap-2">
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="192.168.1.50:8787"
              placeholderTextColorClassName="accent-muted-foreground"
              autoCapitalize="none"
              autoCorrect={false}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2.5 font-sora text-sm text-foreground"
            />
            <Pressable
              onPress={() => handleConnect(address)}
              disabled={!address.trim()}
              className={`flex-row items-center gap-1.5 rounded-md px-4 py-2.5 ${address.trim() ? 'bg-primary' : 'bg-muted'}`}
            >
              <Zap size={14} color={address.trim() ? colors.primaryForeground : colors.mutedForeground} />
              <Text className={`font-sora-bold text-xs ${address.trim() ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                {t('common.connect')}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <QrScannerModal
        visible={scannerVisible}
        onResult={handleScanResult}
        onClose={() => setScannerVisible(false)}
        hint={t('sendToWorshipHubSheet.scanHint')}
      />
    </View>
  );
}
