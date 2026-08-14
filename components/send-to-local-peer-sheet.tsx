import BottomSheet, { BottomSheetScrollView } from '@expo/ui/community/bottom-sheet';
import { Check, Laptop, RefreshCw, ShieldAlert, Zap } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { getSongsForExport } from '@/db/songs-repository';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { type DiscoveredPeer, discoverSongsDesktopPeers } from '@/lib/discovery';
import { pushSongsToLocalPeer, verifyLocalSyncPeer } from '@/lib/songs-peer-client';

type Phase = 'searching' | 'found' | 'manual' | 'sending' | 'done' | 'error';

interface Target {
  label: string;
  baseUrl: string;
}

// Native bottom sheet for "Sincronización Local" — pushes songs to
// ANOTHER INSTANCE OF THIS SAME APP (desktop or web) on the LAN, nothing
// to do with WorshipHub. Mirrors standalone/songs' LocalSyncModal.tsx:
// auto-discover over mDNS (see lib/discovery.ts — same
// `_whsongs._tcp.local.` announcement the desktop app's own peer
// discovery browses), or fall back to a typed address, then a plain-HTTP
// identity check + push (see lib/songs-peer-client.ts) — no self-signed
// certificate, no pairing token, unlike sending to WorshipHub. Simpler
// than the desktop modal in one way: one target at a time instead of a
// multi-select checklist, matching this app's other send sheets.
export function SendToLocalPeerSheet({
  visible,
  songIds,
  onClose,
  onSent,
}: {
  visible: boolean;
  songIds: number[];
  onClose: () => void;
  onSent?: () => void;
}) {
  const colors = useThemeColors();
  const [phase, setPhase] = useState<Phase>('searching');
  const [peers, setPeers] = useState<DiscoveredPeer[]>([]);
  const [target, setTarget] = useState<Target | null>(null);
  const [address, setAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [sentCount, setSentCount] = useState(0);

  const runDiscovery = () => {
    setPhase('searching');
    setPeers([]);
    discoverSongsDesktopPeers().then((found) => {
      setPeers(found);
      setPhase(found.length > 0 ? 'found' : 'manual');
    });
  };

  useEffect(() => {
    if (visible) runDiscovery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const sendTo = async (t: Target) => {
    setTarget(t);
    setPhase('sending');
    setErrorMessage('');
    try {
      const isSongsPeer = await verifyLocalSyncPeer(t.baseUrl);
      if (!isSongsPeer) throw new Error('wrong-app');
      const songs = await getSongsForExport(songIds);
      const received = await pushSongsToLocalPeer(
        t.baseUrl,
        songs.map((s) => ({ title: s.title, artist: s.artist, language: s.language, lyrics: s.lyrics }))
      );
      setSentCount(received);
      setPhase('done');
      onSent?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setErrorMessage(localSyncErrorMessage(message));
      setPhase('error');
    }
  };

  const sendToPeer = (peer: DiscoveredPeer) => sendTo({ label: peer.name, baseUrl: `http://${peer.ip}:${peer.port}` });

  const submitAddress = () => {
    const raw = address.trim().replace(/\/+$/, '');
    if (!raw) return;
    const baseUrl = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
    void sendTo({ label: baseUrl, baseUrl });
  };

  const handleClose = () => {
    setAddress('');
    setTarget(null);
    onClose();
  };

  return (
    <BottomSheet index={visible ? 0 : -1} snapPoints={['70%']} enablePanDownToClose onClose={handleClose}>
      <View className="gap-0.5 px-5 pb-4">
        <Text className="font-sora-bold text-lg text-foreground">Sincronización local</Text>
        <Text className="font-sora text-xs text-muted-foreground">
          {songIds.length} {songIds.length === 1 ? 'canción' : 'canciones'} a otra copia de la app
        </Text>
      </View>

      <BottomSheetScrollView className="flex-1" contentContainerClassName="gap-4 px-5 pb-8">
        {phase === 'searching' && (
          <View className="items-center gap-3 py-10">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="font-sora text-sm text-muted-foreground">Buscando otras copias en esta red…</Text>
          </View>
        )}

        {phase === 'found' && (
          <View className="gap-3">
            <Text className="font-sora text-xs text-muted-foreground">Encontradas en esta red — toca una para enviar ahí:</Text>
            {peers.map((peer) => (
              <Pressable
                key={`${peer.ip}:${peer.port}`}
                onPress={() => sendToPeer(peer)}
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
              No encontramos otra copia automáticamente — escribe su dirección (Ajustes → Sincronización local en esa app la
              muestra).
            </Text>

            <View className="flex-row gap-2">
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="192.168.1.42:47822"
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
                <Text
                  className={`font-sora-bold text-xs ${address.trim() ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                >
                  Enviar
                </Text>
              </Pressable>
            </View>

            <Pressable onPress={runDiscovery} className="flex-row items-center justify-center gap-1.5 self-center px-2 py-1.5">
              <RefreshCw size={12} color={colors.primary} />
              <Text className="font-sora-bold text-xs text-primary">Buscar de nuevo</Text>
            </Pressable>
          </View>
        )}

        {phase === 'sending' && (
          <View className="items-center gap-3 py-10">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-center font-sora text-sm text-muted-foreground">
              Enviando{target ? ` a ${target.label}` : ''}…
            </Text>
          </View>
        )}

        {phase === 'done' && (
          <View className="items-center gap-3 py-8">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <Check size={24} color={colors.primary} strokeWidth={2.5} />
            </View>
            <Text className="text-center font-sora-semibold text-sm text-foreground">
              {sentCount} {sentCount === 1 ? 'canción enviada' : 'canciones enviadas'}
            </Text>
            <Pressable onPress={handleClose} className="mt-2 rounded-full bg-muted px-5 py-2">
              <Text className="font-sora-bold text-xs text-foreground">Cerrar</Text>
            </Pressable>
          </View>
        )}

        {phase === 'error' && (
          <View className="items-center gap-3 py-8">
            <ShieldAlert size={28} color={colors.destructive} />
            <Text className="text-center font-sora text-sm text-destructive">{errorMessage}</Text>
            <Pressable
              onPress={() => (target ? void sendTo(target) : setPhase('manual'))}
              className="mt-2 rounded-full bg-primary px-5 py-2"
            >
              <Text className="font-sora-bold text-xs text-primary-foreground">Reintentar</Text>
            </Pressable>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

function localSyncErrorMessage(message: string): string {
  if (message === 'wrong-app') return 'Esa dirección no es de otra instancia de WorshipHub Songs.';
  if (message.startsWith('HTTP ')) return `Respondió con un error (${message}). Revisa que esa app esté abierta y actualizada.`;
  return `No se pudo enviar. Revisa que ambas apps estén en la misma red. (${message || 'sin detalle'})`;
}
