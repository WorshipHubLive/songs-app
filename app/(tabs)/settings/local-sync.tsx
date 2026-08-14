import { AmbientGlow } from '@/components/ambient-glow';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { LOCAL_SYNC_PORT, localSyncDeviceName } from '@/lib/local-sync-device';
import * as Network from 'expo-network';
import { Stack } from 'expo-router';
import { Laptop, Radio } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// Mirrors Settings.tsx's Local Sync subTab — but only its *desktop*
// ("isTauri") branch: this app now runs its own always-on mDNS-advertised
// microserver too (see hooks/use-local-sync-server.ts, modules/
// local-sync-server), so it's a real peer exactly like a desktop
// instance, not a "web build with no server of its own" that has to save
// a desktop address and poll. That's why there's no address field or
// device picker here anymore — both directions (desktop -> phone, phone
// -> desktop) discover each other automatically over the LAN. This QR +
// address is for the ONE client that still can't do LAN discovery on its
// own: standalone/songs' web build, which reaches a peer by a
// scanned/typed address — same reason desktop's own Settings shows a QR
// of ITS address here. Sending FROM this phone still has its own picker,
// reached from the Songs screen's selection mode (see
// components/send-to-local-peer-sheet.tsx), unrelated to this screen.
export default function LocalSyncScreen() {
  const colors = useThemeColors();
  const deviceName = localSyncDeviceName();
  const [ip, setIp] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Network.getIpAddressAsync()
      .then((value) => {
        if (!cancelled) setIp(value || null);
      })
      .catch(() => {
        if (!cancelled) setIp(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const address = ip ? `http://${ip}:${LOCAL_SYNC_PORT}` : null;

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

        <View className="items-center gap-3 rounded-md border border-border bg-card p-6">
          <View className="relative h-12 w-12 items-center justify-center rounded-full bg-primary/15">
            <Radio size={22} color={colors.primary} />
            <View className="absolute top-0 right-0 flex size-3">
              <View className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <View className="relative inline-flex size-3 rounded-full bg-primary" />
            </View>
          </View>
          <Text className="text-center font-sora-bold text-sm text-foreground">Sincronización local activada</Text>
          <Text className="text-center font-sora text-xs text-muted-foreground">
            Otras copias de WorshipHub Songs en esta red (de escritorio o de otro teléfono) te encuentran
            automáticamente — no hace falta guardar ninguna dirección aquí.
          </Text>
          <View className="mt-1 flex-row items-center gap-2 rounded-full border border-border px-3 py-1.5">
            <Laptop size={13} color={colors.mutedForeground} />
            <Text className="font-mono text-[11px] text-muted-foreground">{deviceName}</Text>
          </View>
        </View>

        <View className="items-center gap-3 rounded-md border border-border bg-card p-6">
          <Text className="text-center font-sora-semibold text-sm text-foreground">
            Escanea para sincronizar con este teléfono
          </Text>
          <Text className="text-center font-sora text-xs text-muted-foreground">
            Desde la versión web de Songs en otro dispositivo, entra a Ajustes → Sincronización local y escanea este
            código (o escribe la dirección a mano) — la versión web no puede buscar en la red por sí sola.
          </Text>
          {address ? (
            <>
              <View className="rounded-lg bg-white p-3">
                <QRCode value={address} size={180} />
              </View>
              <Text className="font-mono text-xs text-muted-foreground">{address}</Text>
            </>
          ) : (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
