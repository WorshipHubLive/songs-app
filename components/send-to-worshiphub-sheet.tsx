import { QrScannerModal } from '@/components/qr-scanner-modal';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { discoverWorshipHub, type DiscoveredPeer } from '@/lib/discovery';
import { Info, Laptop, Loader2, QrCode, RefreshCw, Zap } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

type Phase = 'searching' | 'found' | 'manual' | 'unavailable';

// Bottom sheet mirroring SendSongsModal's "connect" flow: auto-discover
// WorshipHub over mDNS as soon as it opens (see lib/discovery.ts — same
// `_worshiphub._tcp.local.` announcement the desktop app's own discovery
// browses), falling back to a scanned/typed address. Once a target is
// picked we're honest that the actual pairing handshake + send call
// aren't wired up yet (no self-signed-HTTPS client, no token flow) —
// same caveat as settings/worshiphub.tsx, just reached from here too.
export function SendToWorshipHubSheet({
  visible,
  count,
  onClose,
}: {
  visible: boolean;
  count: number;
  onClose: () => void;
}) {
  const colors = useThemeColors();
  const { updateWorshipHub } = useAppSettings();
  const [phase, setPhase] = useState<Phase>('searching');
  const [peers, setPeers] = useState<DiscoveredPeer[]>([]);
  const [targetLabel, setTargetLabel] = useState('');
  const [address, setAddress] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);

  const runDiscovery = () => {
    setPhase('searching');
    setPeers([]);
    discoverWorshipHub().then((found) => {
      setPeers(found);
      setPhase(found.length > 0 ? 'found' : 'manual');
    });
  };

  useEffect(() => {
    if (visible) runDiscovery();
  }, [visible]);

  const selectTarget = (label: string, baseUrl: string) => {
    setTargetLabel(label);
    updateWorshipHub({ baseUrl });
    setPhase('unavailable');
  };

  const selectPeer = (peer: DiscoveredPeer) => selectTarget(peer.name, `https://${peer.ip}:${peer.port}`);

  const submitAddress = () => {
    const raw = address.trim().replace(/\/+$/, '');
    if (!raw) return;
    const baseUrl = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    selectTarget(baseUrl, baseUrl);
  };

  const handleScanResult = (value: string) => {
    setScannerVisible(false);
    const base = value.replace(/\/remote\/ws\/?$/i, '').replace(/\/+$/, '');
    const baseUrl = /^https?:\/\//i.test(base) ? base : `https://${base}`;
    selectTarget(baseUrl, baseUrl);
  };

  const handleClose = () => {
    setAddress('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable className="flex-1 justify-end bg-black/60" onPress={handleClose}>
        <Pressable className="max-h-[80%] rounded-t-3xl border-t border-border bg-card" onPress={(e) => e.stopPropagation()}>
          <View className="items-center pb-1 pt-3">
            <View className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          </View>

          <View className="gap-0.5 px-5 pb-4">
            <Text className="font-sora-bold text-lg text-foreground">Enviar a WorshipHub</Text>
            <Text className="font-sora text-xs text-muted-foreground">
              {count} {count === 1 ? 'canción' : 'canciones'} en el servicio
            </Text>
          </View>

          <ScrollView contentContainerClassName="gap-4 px-5 pb-8">
            {phase === 'searching' && (
              <View className="items-center gap-3 py-10">
                <Loader2 size={28} color={colors.primary} />
                <Text className="font-sora text-sm text-muted-foreground">Buscando WorshipHub en esta red…</Text>
              </View>
            )}

            {phase === 'found' && (
              <View className="gap-3">
                <Text className="font-sora text-xs text-muted-foreground">Encontrados en esta red — toca uno para enviar ahí:</Text>
                {peers.map((peer) => (
                  <Pressable
                    key={`${peer.ip}:${peer.port}`}
                    onPress={() => selectPeer(peer)}
                    className="flex-row items-center gap-3 rounded-md border border-border px-3 py-2.5"
                  >
                    <Laptop size={16} color={colors.mutedForeground} />
                    <Text className="min-w-0 flex-1 font-sora-semibold text-sm text-foreground" numberOfLines={1}>
                      {peer.name}
                    </Text>
                    <Text className="shrink-0 font-mono text-xs text-muted-foreground">{peer.ip}</Text>
                  </Pressable>
                ))}
                <Pressable onPress={runDiscovery} className="flex-row items-center justify-center gap-1.5 self-center px-2 py-1.5">
                  <RefreshCw size={12} color={colors.primary} />
                  <Text className="font-sora-bold text-xs text-primary">Buscar de nuevo</Text>
                </Pressable>
                <Pressable onPress={() => setPhase('manual')} className="self-center px-2 py-1">
                  <Text className="font-sora text-xs text-muted-foreground underline">¿No aparece? Escribe la dirección</Text>
                </Pressable>
              </View>
            )}

            {phase === 'manual' && (
              <View className="gap-3">
                <Text className="font-sora text-xs text-muted-foreground">
                  No encontramos WorshipHub automáticamente — escanea su código QR o escribe su dirección.
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
                  <Text className="font-sora text-[10px] text-muted-foreground">o</Text>
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
                    onPress={submitAddress}
                    disabled={!address.trim()}
                    className={`flex-row items-center gap-1.5 rounded-md px-4 py-2.5 ${address.trim() ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <Zap size={14} color={address.trim() ? colors.primaryForeground : colors.mutedForeground} />
                    <Text className={`font-sora-bold text-xs ${address.trim() ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                      Conectar
                    </Text>
                  </Pressable>
                </View>

                <Pressable onPress={runDiscovery} className="flex-row items-center justify-center gap-1.5 self-center px-2 py-1.5">
                  <RefreshCw size={12} color={colors.primary} />
                  <Text className="font-sora-bold text-xs text-primary">Buscar de nuevo</Text>
                </Pressable>
              </View>
            )}

            {phase === 'unavailable' && (
              <View className="items-center gap-3 py-6">
                <Info size={28} color={colors.primary} />
                <Text className="text-center font-sora-semibold text-sm text-foreground">Conectado a {targetLabel}</Text>
                <Text className="text-center font-sora text-xs leading-5 text-muted-foreground">
                  Guardamos esta dirección, pero emparejar y enviar canciones de verdad todavía no está implementado
                  en esta app — llegará en una próxima actualización.
                </Text>
                <Pressable onPress={handleClose} className="mt-2 rounded-full bg-muted px-5 py-2">
                  <Text className="font-sora-bold text-xs text-foreground">Cerrar</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>

      <QrScannerModal
        visible={scannerVisible}
        onResult={handleScanResult}
        onClose={() => setScannerVisible(false)}
        hint="Apunta al código QR que muestra WorshipHub."
      />
    </Modal>
  );
}
