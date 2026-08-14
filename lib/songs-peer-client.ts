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
