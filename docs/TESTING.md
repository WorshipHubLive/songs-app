# Testing

Two layers: Jest (unit) and Maestro (end-to-end UI, against a real
build).

## Unit tests (Jest)

```bash
bun run test          # once
bun run test:watch
bun run test:coverage
```

Gated in CI on every PR (`.github/workflows/ci.yml`, alongside
`bun run lint` and `bun run typecheck`).

## End-to-end (Maestro)

`.maestro/` has two flows:
- `smoke-test.yaml` — app launches, all three tabs (Songs, Service,
  Settings) are reachable.
- `add-song.yaml` — creates a song through the real UI and confirms the
  save succeeded.

These run against an **installed build**, not the JS bundle alone —
Maestro drives the actual app on a simulator/device/emulator by its
app identifier. Install Maestro if you haven't:
[docs.maestro.dev/getting-started/installing-maestro](https://docs.maestro.dev/getting-started/installing-maestro).

### Running against iOS

```bash
bunx expo run:ios          # builds + installs on a booted simulator
bun run e2e                # or: maestro test .maestro/
```

The flows default to the iOS bundle identifier
(`live.worshiphub.songs`, matching `app.json`'s
`ios.bundleIdentifier`), so no flags needed for iOS.

### Running against Android

Android's package name (`app.json`'s `android.package`,
`com.fercho34.songsapp`) is **not** the same string as the iOS bundle
identifier — this project intentionally uses different identifiers per
platform (unlike `standalone/songs`, the desktop app, which uses one
identifier everywhere). Override the flow's `appId` for an Android run:

```bash
bunx expo run:android
maestro test -e MAESTRO_APP_ID=com.fercho34.songsapp .maestro/
```

(`appId: ${MAESTRO_APP_ID}` in both flow files defaults to the iOS id
via each flow's own `env:` block when the flag isn't passed — see
either `.yaml` file's header comment.)

### Notes on the flows themselves

- Assertions are in Spanish (`"Canciones"`, `"Ajustes"`, …) because the
  app is fully localized and these flows were written against a
  Spanish-locale simulator. Running against a device set to another
  language will fail on the text assertions, not because the app is
  broken — update the strings (or add a locale override step) if you
  need this to run against a different device locale.
- Both flows have an `optional: true` tap to dismiss
  `expo-dev-client`'s one-time "Dev Tools" tutorial / dev menu overlay,
  since a fresh dev-client install shows it on first launch and a
  reused simulator won't. Only relevant for **development-profile**
  builds — a production build has no dev-client overlay to dismiss, and
  that step is a no-op against one.
- `add-song.yaml` drags the floating dev-menu bubble out of the way
  before tapping Save, since it overlaps the same corner and would
  otherwise intercept the tap on a dev build.

### CI

Maestro runs are **not** wired into GitHub Actions today — that needs
either a self-hosted macOS/Android runner or a paid device-cloud
integration (e.g. Maestro Cloud, `eas.json`'s `build` profiles running
through EAS's own Maestro integration). Deliberately left as a manual
step for now rather than silently adding a paid dependency; run the
flows locally (or against an EAS development build) before merging a
change that touches navigation, song creation, or the tab bar.
