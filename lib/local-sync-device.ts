import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Same port standalone/songs' desktop app listens on (its own
// src-tauri/src/server.rs `PORT` constant) — a different device on the
// LAN, so no conflict; using the same port means this device shows up in
// the desktop's *existing* mDNS peer picker exactly like another desktop
// instance, not as a separate "web peer" bucket. Shared between
// hooks/use-local-sync-server.ts (which binds to it), lib/discovery.ts
// (which uses it to recognize — and skip — our own advertisement when
// browsing), and the Local Sync settings screen (troubleshooting).
export const LOCAL_SYNC_PORT = 47822;

// Not routed through i18n on purpose — this is a network-broadcast mDNS
// instance name another device's peer picker displays (see
// worshiphub-client.ts's own DEVICE_NAME for the same pattern), not
// conversational UI text a user reads in their own language.
//
// Every prior version of this returned the literal string
// "Songs Mobile (iOS)"/"Songs Mobile (Android)" — identical for every
// install, so two phones on the same network were indistinguishable in
// the peer picker. `Device.modelName` (e.g. "iPhone 15 Pro", "Pixel 8")
// actually varies per device and needs no special setup.
//
// `Device.deviceName` (the user's own "Fernando's iPhone") would be
// better still, but on iOS 16+ Apple gates the real value behind the
// `com.apple.developer.device-information.user-assigned-device-name`
// entitlement — a restricted entitlement Apple grants case-by-case
// (mainly MDM/enterprise use), not something a consumer app can just
// add. Without it, `deviceName` is the non-null but useless literal
// string "iPhone" for every iOS device, so it's only worth reading on
// Android, where no such restriction exists.
export function localSyncDeviceName(): string {
  const os = Platform.OS === 'ios' ? 'iOS' : 'Android';
  const label = Platform.OS === 'android' ? (Device.deviceName ?? Device.modelName) : Device.modelName;
  return label ? `${label} (${os})` : `Songs Mobile (${os})`;
}
