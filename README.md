<div align="center">

  <img src="assets/brand/WorshipHub_Songs_Logo.png" alt="WorshipHub Songs Logo" width="420" />

  <br />

  ### 🎵 Mobile song library, chords, and translations for WorshipHub

  [![Expo SDK 57](https://img.shields.io/badge/Expo_SDK_57-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![React Native](https://img.shields.io/badge/React_Native_0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![EAS](https://img.shields.io/badge/EAS_Build_%2B_Update-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/eas)

  [🏗 Architecture](#-architecture) • [🛠 Development](#-development-guide) • [📝 Changelog](docs/CHANGELOG.md) • [📦 Releasing](docs/RELEASING.md) • [🧪 Testing](docs/TESTING.md)

</div>

---

## 📖 Overview

**WorshipHub Songs (mobile)** is the iOS/Android companion to
[`standalone/songs`](../songs) (the Tauri desktop app): the same song
library — lyrics, chords, per-instrument arrangements, translations —
built natively with Expo/React Native instead of Tauri, sharing the same
WorshipHub pairing protocol and Local Sync design.

- Native iOS and Android app via Expo (bare workflow — `ios/` and
  `android/` are generated locally with `expo prebuild`, not committed).
- SQLite on-device storage (`db/`, via `expo-sqlite` + Drizzle ORM).
- Sends songs to the WorshipHub desktop app over the local network
  (mDNS/Bonjour discovery via `react-native-zeroconf`, HTTPS with a
  self-signed cert — see `plugins/withInsecureWorshipHubClient.js` for
  why that's a deliberate trust model, not a shortcut).
- Local Sync between phones/tablets, same one-way push design as the
  desktop app.
- Translated into 9 languages (`i18n/locales/`).
- OTA JS updates via `expo-updates` + EAS Update — see
  [`docs/RELEASING.md`](docs/RELEASING.md).

---

## 🏗 Architecture

```text
app/                  # expo-router file-based routes
  (tabs)/              # Songs / Service / Settings tab navigator
  [songId]/             # Song details, editor, translation screens
components/            # UI components
lib/                    # WorshipHub client, Local Sync, chord parsing, discovery
db/                     # SQLite schema + repositories (Drizzle ORM)
i18n/locales/           # 9-language translation dictionaries
modules/local-sync-server/  # Native module: on-device HTTP microserver for Local Sync
plugins/                # Expo config plugins (withInsecureWorshipHubClient)
.maestro/               # End-to-end UI flows (see docs/TESTING.md)
```

Styling is [Uniwind](https://docs.uniwind.dev/) (Tailwind CSS v4 for
React Native) — see `global.css` and `uniwind-types.d.ts`.

---

## 🛠 Development Guide

### Prerequisites
- [Bun](https://bun.sh/)
- Xcode (iOS) and/or Android Studio + SDK (Android)
- [EAS CLI](https://docs.expo.dev/eas/) — `bun add -g eas-cli`, then `eas login`

### Installation

```bash
cd standalone/songs-app
bun install

# First run only (or after any native config/plugin change) — generates
# ios/ and android/, which are gitignored on purpose (see docs/RELEASING.md
# for why EAS Build always regenerates them fresh instead of using
# whatever's committed).
bunx expo prebuild

bun run ios      # or: bun run android
```

### Available scripts

| Command | Description |
|---|---|
| `bun run start` | Expo dev server |
| `bun run ios` / `bun run android` | Native build + run on simulator/device |
| `bun run lint` / `lint:fix` | Biome check (formatting + linting) |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run test` / `test:watch` / `test:coverage` | Jest |
| `bun run e2e` | Maestro flows — see [`docs/TESTING.md`](docs/TESTING.md) |

### Documentation

- 📝 **Changelog**: [`docs/CHANGELOG.md`](docs/CHANGELOG.md)
- 📦 **Building & releasing** (EAS Build, EAS Update, GitHub Actions, one-time account setup): [`docs/RELEASING.md`](docs/RELEASING.md)
- 🧪 **Testing** (Jest, Maestro E2E, CI gates): [`docs/TESTING.md`](docs/TESTING.md)

---

<div align="center">
  <sub>Built with ❤️ by the WorshipHub Team</sub>
</div>
