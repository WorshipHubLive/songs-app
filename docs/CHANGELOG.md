# WorshipHub Songs (mobile) — Changelog

Feature-level changelog, not a commit log. Each release lists what the
app can actually **do** at that point, grouped by area, so a future
release's notes only need to describe the delta against the last entry
here — diff this file against what changed to know what to write.

---

## [1.0.0] — Initial release

Not yet published to the App Store / Play Store — this entry covers
everything built so far, since there's no prior release to diff
against.

### 📚 Song library
- Create, edit, and delete songs: title, artist, original language,
  lyrics, chords.
- SQLite-backed storage on-device (`db/`, Drizzle ORM), same schema
  shape as the desktop app's library.
- Search across the library.

### 🎸 Chords
- ChordPro-style chord entry and rendering (`lib/chord-pro.ts`).
- Online lyrics/chord search from the editor.

### 🌍 Translations
- Add lyric translations per song, switch the viewed language without
  touching the stored original (`app/[songId]/translate.tsx`).
- Fully localized UI: 9 languages (`i18n/locales/`).

### 📡 Sending to WorshipHub
- Finds WorshipHub automatically via mDNS/Bonjour on the same network
  (`lib/discovery.ts`, `react-native-zeroconf`).
- Pairs and sends songs over HTTPS with WorshipHub's self-signed cert —
  see `plugins/withInsecureWorshipHubClient.js` for why that's a
  deliberate trust model shared with the desktop app, not a shortcut.
- Bulk song selection for sending multiple at once.
- Profile settings (display name, avatar) sent along with pairing/push,
  same identity model as `standalone/songs`.

### 🔁 Local Sync
- Phone-to-phone/tablet song sync on the same LAN, one-way by design
  (same model as the desktop app's Local Sync).
- Backed by a native on-device HTTP microserver
  (`modules/local-sync-server/`) and a background heartbeat
  (`hooks/`) so a sync target stays reachable without a screen open.
- QR-code pairing (`react-native-qrcode-svg`) as an alternative to
  manual address entry.
- The peer picker no longer lists this same device as a discoverable
  target — this app's own Local Sync server advertises itself over
  mDNS the same way the desktop app's does (so the desktop can find
  it), which meant browsing for peers always found yourself too; now
  filtered out by matching ip+port against this device's own, the same
  way the desktop app already filters its own advertisement out of its
  peer list.
- Peer names are now per-device (`Device.modelName`/`deviceName` via
  `expo-device`, e.g. "iPhone 15 Pro" or a Android device's own
  assigned name) instead of the literal string "Songs Mobile (iOS)" /
  "Songs Mobile (Android)" every install showed, which made two phones
  on the same network indistinguishable in the picker.

### 💻 Cross-platform (iOS + Android)
- Native Expo/React Native app, iOS and Android from one codebase.
- Platform-specific UI adjustments where the platforms genuinely
  differ (headers, swipe actions, native bottom sheets).
- Settings: appearance, language, Local Sync, WorshipHub pairing,
  search preferences, profile — each its own screen under
  `app/(tabs)/settings/`.
- OTA updates via `expo-updates` + EAS Update (see
  [`RELEASING.md`](RELEASING.md)) — a JS/asset-only fix or feature
  reaches installed builds without a new store submission.

### 🛠 Tooling
- Biome (lint + format), Jest (unit tests), Maestro (end-to-end UI
  flows) — see [`TESTING.md`](TESTING.md).
- GitHub Actions: PR gate (lint/typecheck/test) and EAS Update
  publishing (preview per PR, production on merge to `main`) — see
  [`RELEASING.md`](RELEASING.md).
