// "Local Sync" — pushes songs to ANOTHER INSTANCE OF THIS SAME APP
// (desktop or web) on the LAN. Nothing to do with WorshipHub (see
// lib/worshiphub-client.ts for that) — this talks to the desktop app's
// own always-on mDNS-advertised microserver (see
// standalone/songs/src-tauri/src/server.rs, port 47822) or a web build's
// equivalent routes. Mirrors the web app's own `peerSyncApi.connectWeb` /
// `.pushWeb` (src/lib/api.ts) exactly: plain HTTP, no self-signed
// certificate involved (unlike WorshipHub's server), so plain `fetch`
// works — no react-native-blob-util `trusty` workaround needed here.
export interface SongExport {
  title: string;
  artist: string;
  language: string;
  lyrics: string;
}

interface ImportResponse {
  received?: number;
}

// Only refuses on a CONFIRMED mismatch — stops an mDNS mixup or a
// mis-scanned/mis-typed address (e.g. WorshipHub's own QR code) from
// silently being treated as another Songs instance. An inconclusive
// check (unreachable, older build) does NOT block — the push below will
// fail on its own, with a clearer error, if the address genuinely isn't
// reachable.
async function verifyIsSongsPeer(baseUrl: string): Promise<'match' | 'mismatch' | 'unknown'> {
  try {
    const res = await fetch(`${baseUrl}/identity`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return 'unknown';
    const data = (await res.json()) as { app?: string };
    if (!data.app) return 'unknown';
    return data.app === 'songs' ? 'match' : 'mismatch';
  } catch {
    return 'unknown';
  }
}

export async function verifyLocalSyncPeer(baseUrl: string): Promise<boolean> {
  const base = baseUrl.replace(/\/+$/, '');
  return (await verifyIsSongsPeer(base)) !== 'mismatch';
}

/**
 * Pushes `songs` to another Songs instance's library — matched by title
 * there, existing songs are left untouched. Chords and translations
 * never travel over this route, same as the web build's `pushWeb`.
 * Throws `Error('wrong-app')` if the address is confirmed to be
 * something else (WorshipHub, Notes).
 */
export async function pushSongsToLocalPeer(baseUrl: string, songs: SongExport[]): Promise<number> {
  const base = baseUrl.replace(/\/+$/, '');
  if ((await verifyIsSongsPeer(base)) === 'mismatch') throw new Error('wrong-app');

  const res = await fetch(`${base}/songs/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(songs),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as ImportResponse;
  return data.received ?? 0;
}

interface OutboxResponse {
  songs?: SongExport[];
}

// The reverse direction, desktop -> this app: a phone can't run a
// listening server the way the desktop app does (its always-on mDNS
// microserver, see server.rs), so it shows up in the desktop's device
// picker the same way a web build does — by polling. Registering
// creates/renews this device's entry in the desktop's in-memory
// `web_peers` map (see server.rs's `peer_register`); anything queued for
// it there (via `songs_web_peer_push`) is drained on the next
// `peer-outbox` poll. Mirrors the web app's `useLocalSyncHeartbeat`
// exactly — same two routes, same shape.
export async function registerAsLocalSyncPeer(baseUrl: string, clientId: string, name: string): Promise<void> {
  const base = baseUrl.replace(/\/+$/, '');
  const res = await fetch(`${base}/peer-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: clientId, name }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function pollLocalSyncOutbox(baseUrl: string, clientId: string): Promise<SongExport[]> {
  const base = baseUrl.replace(/\/+$/, '');
  const res = await fetch(`${base}/peer-outbox/${clientId}`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as OutboxResponse;
  return data.songs ?? [];
}
