import { insertSongIfMissing } from '@/db/songs-repository';
import { pollLocalSyncOutbox, registerAsLocalSyncPeer } from '@/lib/songs-peer-client';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useAppSettings } from './use-app-settings';

const POLL_INTERVAL_MS = 4000;

/**
 * Keeps this device "present" to the desktop Songs instance saved in
 * Settings > Sincronización Local, for as long as the app stays open —
 * the mobile-app mirror of standalone/songs' own `useLocalSyncHeartbeat`
 * (src/lib/useLocalSyncHeartbeat.ts). Sending phone -> desktop is a plain
 * outbound push (see components/send-to-local-peer-sheet.tsx) and needs
 * none of this. This is only for the reverse direction: a phone can't
 * run a listening server the way the desktop's always-on mDNS
 * microserver does, so desktop -> phone works by this device registering
 * itself on an interval (so the desktop's device picker can list it,
 * same as a web build) and draining whatever's been queued for it on
 * each tick.
 */
export function useLocalSyncHeartbeat(): boolean {
  const { settings, updateLocalSyncPeer } = useAppSettings();
  const [connected, setConnected] = useState(false);
  const baseUrl = settings.localSyncPeer.baseUrl;
  const clientId = settings.localSyncPeer.clientId;

  useEffect(() => {
    if (!baseUrl) {
      setConnected(false);
      return;
    }
    if (!clientId) {
      updateLocalSyncPeer({ clientId: generateClientId() });
      return;
    }

    let cancelled = false;
    const deviceName = `Songs móvil (${Platform.OS === 'ios' ? 'iOS' : 'Android'})`;

    const tick = async () => {
      try {
        await registerAsLocalSyncPeer(baseUrl, clientId, deviceName);
        const incoming = await pollLocalSyncOutbox(baseUrl, clientId);
        for (const song of incoming) {
          await insertSongIfMissing(song);
        }
        if (!cancelled) setConnected(true);
      } catch {
        if (!cancelled) setConnected(false);
      }
    };

    void tick();
    const interval = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [baseUrl, clientId, updateLocalSyncPeer]);

  return connected;
}

function generateClientId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}
