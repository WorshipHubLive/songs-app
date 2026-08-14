import { Platform } from 'react-native';

// Same port standalone/songs' desktop app listens on (its own
// src-tauri/src/server.rs `PORT` constant) — a different device on the
// LAN, so no conflict; using the same port means this device shows up in
// the desktop's *existing* mDNS peer picker exactly like another desktop
// instance, not as a separate "web peer" bucket. Shared between
// hooks/use-local-sync-server.ts (which binds to it) and the Local Sync
// settings screen (which just displays it for troubleshooting).
export const LOCAL_SYNC_PORT = 47822;

export function localSyncDeviceName(): string {
  return `Songs móvil (${Platform.OS === 'ios' ? 'iOS' : 'Android'})`;
}
