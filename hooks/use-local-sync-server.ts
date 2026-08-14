import { insertSongIfMissing } from '@/db/songs-repository';
import {
  addLocalSyncRequestListener,
  respondToLocalSyncRequest,
  startLocalSyncServer,
  stopLocalSyncServer,
  type LocalSyncRequestEvent,
} from '@/modules/local-sync-server';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// Same port standalone/songs' desktop app listens on (its own
// src-tauri/src/server.rs `PORT` constant) — a different device on the
// LAN, so no conflict; using the same port means this device shows up in
// the desktop's *existing* mDNS peer picker exactly like another
// desktop instance (`kind: 'lan'`), not as a separate "web peer" bucket.
const PORT = 47822;

interface SongPayload {
  title: string;
  artist: string;
  language: string;
  lyrics: string;
}

/**
 * Runs this app's own tiny HTTP server (see modules/local-sync-server)
 * for the whole life of the app, advertised over mDNS as
 * `_whsongs._tcp` — the mobile equivalent of standalone/songs' always-on
 * desktop microserver. Lets the desktop app discover and push to THIS
 * device automatically, the same way it already finds another desktop
 * instance, instead of this app having to poll a saved desktop address.
 *
 * Deliberately answers only the two routes a Songs peer ever calls (see
 * server.rs's router): `/identity` (so a scanned/typed address or an
 * mDNS hit can be confirmed as actually being Songs, not WorshipHub or
 * Notes) and `/songs/import` (the actual push). No auth — same trust
 * model as desktop-to-desktop Local Sync, it's a LAN-local, same-app
 * exchange.
 */
export function useLocalSyncServer(): void {
  useEffect(() => {
    const serviceName = `Songs móvil (${Platform.OS === 'ios' ? 'iOS' : 'Android'})`;
    startLocalSyncServer(serviceName, PORT);

    const subscription = addLocalSyncRequestListener((event) => {
      void handleRequest(event, serviceName);
    });

    return () => {
      subscription.remove();
      stopLocalSyncServer();
    };
  }, []);
}

async function handleRequest(event: LocalSyncRequestEvent, deviceName: string): Promise<void> {
  const { requestId, method, path } = event;

  if (method === 'GET' && path === '/identity') {
    respondJson(requestId, 200, { app: 'songs', name: deviceName });
    return;
  }

  if (method === 'POST' && path === '/songs/import') {
    let received = 0;
    try {
      const songs = JSON.parse(event.body) as SongPayload[];
      for (const song of songs) {
        if (await insertSongIfMissing(song)) received++;
      }
      respondJson(requestId, 200, { received });
    } catch {
      respondJson(requestId, 400, { error: 'invalid body' });
    }
    return;
  }

  respondJson(requestId, 404, { error: 'not found' });
}

function respondJson(requestId: string, status: number, body: unknown): void {
  respondToLocalSyncRequest(requestId, status, JSON.stringify(body));
}
