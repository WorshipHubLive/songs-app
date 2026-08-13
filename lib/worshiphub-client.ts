import { Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

// Client side of Service -> WorshipHub: pair (human-approved on
// WorshipHub's own screen) then push lyrics + translations. Mirrors
// standalone/songs' web `worshiphubApi` (src/lib/api.ts) and this repo
// root's `src/songs.rs` endpoints exactly — same JSON field names, same
// `/songs/api/pair-request` + `/songs/api/import-songs` paths.
//
// WorshipHub's local server is HTTPS with a self-signed certificate (see
// this repo root's `src/local_server.rs`) — plain `fetch` would reject
// it outright with no override available in React Native. `trusty: true`
// (react-native-blob-util) is the same trust model the desktop app's own
// Rust client uses (see standalone/songs/src-tauri/src/
// worshiphub_client.rs's header comment): nothing secret travels here,
// it's LAN-local, and the real authorization is the human approval +
// pairing token, not the TLS cert. Android needs a trust manager
// registered at startup for this to work — see
// plugins/withInsecureWorshipHubClient.js.
const DEVICE_NAME = `WorshipHub Songs (${Platform.OS === 'ios' ? 'iOS' : 'Android'})`;

export interface SongExport {
  title: string;
  artist: string;
  language: string;
  lyrics: string;
  translations: { language: string; lyrics: string }[];
}

interface PairResponse {
  approved?: boolean;
  token?: string;
}

interface ImportSongsResponse {
  received?: number;
}

async function postJson<T>(url: string, body: unknown, timeoutMs: number): Promise<T> {
  const res = await ReactNativeBlobUtil.config({ trusty: true, timeout: timeoutMs }).fetch(
    'POST',
    url,
    { 'Content-Type': 'application/json' },
    JSON.stringify(body)
  );
  const status = res.respInfo.status;
  if (status === 401) throw new Error('unauthorized');
  if (status === 429) throw new Error('busy');
  if (status < 200 || status >= 300) throw new Error(`HTTP ${status}`);
  return res.json() as T;
}

/**
 * Sends a pair-request and blocks (up to ~60s) until WorshipHub's
 * operator approves or denies it on the toast there. Pass a previously
 * stored token to silently re-validate an existing pairing.
 */
export async function pairWithWorshipHub(
  baseUrl: string,
  existingToken: string | null,
  personName: string,
  avatarDataUrl: string
): Promise<string> {
  const base = baseUrl.replace(/\/+$/, '');
  const label = personName.trim() || 'WorshipHub Songs';
  const data = await postJson<PairResponse>(
    `${base}/songs/api/pair-request`,
    { deviceName: DEVICE_NAME, label, token: existingToken ?? '', avatarDataUrl },
    60000
  );
  if (!data.approved || !data.token) throw new Error('denied');
  return data.token;
}

/**
 * Pushes lyrics + translations (never chords) for `songs` to an
 * already-paired WorshipHub. Returns how many songs it acknowledged.
 * Throws `Error('unauthorized')` if the token was revoked there.
 */
export async function sendSongsToWorshipHub(
  baseUrl: string,
  token: string,
  songs: SongExport[],
  personName: string,
  avatarDataUrl: string
): Promise<number> {
  const base = baseUrl.replace(/\/+$/, '');
  const data = await postJson<ImportSongsResponse>(
    `${base}/songs/api/import-songs`,
    { token, songs, personName: personName.trim(), deviceName: DEVICE_NAME, avatarDataUrl },
    30000
  );
  return data.received ?? 0;
}
