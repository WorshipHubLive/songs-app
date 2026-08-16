# Releasing

This app ships two different ways, and it matters which one a given
change needs:

- **EAS Update** (OTA) — JS/asset-only changes (screens, copy, logic,
  images bundled through Metro). Ships in seconds, no store review, to
  anyone already running an installed build. This is what the
  `eas-update-*` GitHub Actions workflows automate.
- **EAS Build** — anything that touches native code: a new native
  module, an `app.json` change under `ios`/`android`, a new Expo config
  plugin, or a dependency that ships native code. Produces a new
  `.ipa`/`.apk`/`.aab` that has to go through TestFlight/Play internal
  testing (or the store) again. Triggered manually today via
  `.eas/workflows/build.yml` (`eas workflow:run build`) or `eas build`.

A JS-only change published via EAS Update **cannot** reach a build whose
native code doesn't match what the update assumes — `runtimeVersion`
(`app.json`, currently `{"policy": "appVersion"}`) is what EAS Update
checks to decide whether an installed build is compatible with a given
update. This project's `updates.url` and EAS `projectId` are already set
in `app.json` — nothing to configure there.

---

## One-time setup (do this once per machine / once per repo)

### 1. EAS account access

```bash
bun add -g eas-cli
eas login
```

Confirm you're on the project's Expo account/org and can see this
project:

```bash
eas whoami
eas project:info
```

### 2. `EXPO_TOKEN` — required for GitHub Actions

The workflows in `.github/workflows/eas-update-*.yml` authenticate as a
robot, not as your logged-in CLI session. Create a token and add it as a
repo secret:

1. https://expo.dev/settings/access-tokens → **Create token**.
2. GitHub repo → **Settings → Secrets and variables → Actions → New
   repository secret**.
3. Name: `EXPO_TOKEN`. Value: the token from step 1.

Without this secret, both `eas-update-*.yml` workflows fail immediately
(they check for it explicitly and exit with a clear message rather than
failing deep inside the `eas` CLI).

### 3. EAS Update channels

Channels are what a *build* checks against; branches are what you
*publish* to. `eas.json`'s build profiles now each declare a
`"channel"` (`development`, `preview`, `production`) — but the channel
itself doesn't exist on the server until you create it once:

```bash
eas channel:create production
eas channel:create preview
eas channel:create development
```

`eas channel:create <name>` also creates and links a branch of the same
name, which is what makes `eas-update-production.yml`'s
`eas update --branch production ...` land on builds using the
`production` channel. Skip this and the production workflow will
succeed at publishing but nothing will ever receive it.

Verify:

```bash
eas channel:list
```

### 4. Store credentials (only needed to actually submit)

`eas.json`'s `submit.production` is currently empty — EAS manages
signing credentials remotely by default (nothing to add to this repo).
The first time you run `eas submit`, or the first production
`eas build`, the CLI will prompt to either generate credentials or
import existing ones (Apple Distribution certificate + provisioning
profile; Play Console service account JSON). Follow its prompts; there
is no local `credentials.json` in this project today.

### 5. Link the EAS project to GitHub — required for `.eas/workflows/build.yml`'s auto-trigger

**expo.dev → this project → Settings → GitHub** → connect the
`WorshipHubLive/songs-app` repo. Without this, `build.yml`'s
`on: pull_request` trigger is defined but never fires — builds only
happen via manual `eas workflow:run build.yml`. This is unrelated to
the `EXPO_TOKEN` secret from step 2 (that's for plain GitHub Actions;
this is EAS's own GitHub App).

---

## Normal flow: OTA update (no native change)

Nothing to do manually — push/merge to `main` and
`.github/workflows/eas-update-production.yml` runs the lint/typecheck/
test gate, then publishes to the `production` channel automatically. A
pull request instead gets `.github/workflows/eas-update-preview.yml`,
which comments the PR with a QR code/link to try the change in a
development build without waiting for CI on main.

To publish manually from your machine (e.g. a hotfix without waiting on
CI):

```bash
eas update --branch production --message "Fix: <what and why>"
```

## Normal flow: native build (native code changed)

```bash
# Development client (internal distribution, for testing on a device)
eas build --profile development --platform android
eas build --profile development --platform ios

# Store-bound build
eas build --profile production --platform all

# After a production build finishes:
eas submit --platform android --latest
eas submit --platform ios --latest
```

Or via the pre-defined EAS workflow (`.eas/workflows/build.yml`,
Android-only for now — add iOS back once it's actually needed):

```bash
eas workflow:run build.yml
```

`build.yml` also has an `on: pull_request: branches: [main]` trigger,
so it can fire automatically on every PR into `main` instead of only
running manually — **but that requires linking this EAS project to its
GitHub repo first**, which is a one-time step in the EAS dashboard
(**expo.dev → this project → Settings → GitHub**), not something in
this repo. This is a different integration than `EXPO_TOKEN` /
the `eas-update-*.yml` GitHub Actions above: those authenticate as a
robot via a token and work today; this is EAS's own GitHub App, and the
trigger silently never fires until the project is linked.

`appVersionSource: "remote"` (in `eas.json`) means EAS tracks the build
number/version code itself — you don't hand-edit `app.json`'s version
for every build the way `standalone/songs`'s Tauri app does; bump
`app.json`'s top-level `"version"` only for an actual user-facing
version bump (App Store/Play Store display version), and let
`autoIncrement` (set on the `production` build profile) handle the
build number.

---

## Android app icon / adaptive icon

`android.adaptiveIcon` in `app.json` points at:
- `foregroundImage` / `monochromeImage` — regenerated at 1024×1024
  (`assets/images/android-icon-foreground.png`,
  `android-icon-monochrome.png`) from the source brand assets.
- `backgroundColor` (`#06080f`) — solid color, no `backgroundImage`.
  An earlier `backgroundImage` asset was actually a leftover Figma
  export with the safe-zone guide circles baked into the PNG (visible
  as a light-blue crosshair/circle graphic instead of a clean
  background) — removed rather than fixed, since a flat
  `backgroundColor` is simpler and exactly what it needs to be.

Since `android/` is gitignored and regenerated by `expo prebuild` (see
below), these `app.json`-level assets are the only thing that needs to
be correct — there's no `mipmap-*` folder to hand-edit.

## Why `ios/` and `android/` aren't committed

Both are gitignored (`.gitignore`: `/ios`, `/android`). Local
`expo run:ios`/`expo run:android` generate them via prebuild on demand,
and EAS Build always runs a fresh `expo prebuild` from `app.json` +
plugins before compiling — so `app.json` (plus `plugins/`) is the single
source of truth for native config. If you edit something inside a local
`ios/`/`android/` folder directly, it will silently vanish on the next
prebuild; put the change in `app.json` or a config plugin
(`plugins/withInsecureWorshipHubClient.js` is the existing example)
instead.
