import * as Network from 'expo-network';
import { Platform } from 'react-native';
import Zeroconf, { ImplType } from 'react-native-zeroconf';
import { LOCAL_SYNC_PORT } from './local-sync-device';

export interface DiscoveredPeer {
  name: string;
  ip: string;
  port: number;
}

// Same mDNS (RFC 6762/6763) service types the desktop apps advertise —
// see ScreenWorship's src/local_server.rs (`_worshiphub._tcp.local.`,
// port 8787) and standalone/songs/src-tauri/src/server.rs
// (`_whsongs._tcp.local.`, port 47822). This app never advertises
// `_worshiphub._tcp` — it's only ever a client of WorshipHub, never a
// peer another app discovers — but it DOES advertise `_whsongs._tcp`
// itself (hooks/use-local-sync-server.ts), the same way the desktop app
// advertises its own Local Sync server. That means a browse for
// `_whsongs._tcp` can resolve THIS device's own announcement, exactly
// as the desktop app's `discover_peers()` (src-tauri/src/server.rs) has
// to filter its own ip+port out of ITS `_whsongs._tcp` browse — see
// `discoverSongsDesktopPeers` below for the same filter on this side.
const WORSHIPHUB_TYPE = 'worshiphub';
const SONGS_TYPE = 'whsongs';

const IPV4_REGEX = /^\d{1,3}(\.\d{1,3}){3}$/;

function resolveIpv4(addresses: string[]): string | null {
  return addresses.find((addr) => IPV4_REGEX.test(addr)) ?? null;
}

// Browses `serviceType` for `timeoutMs`, resolving with every distinct
// peer found in that window (deduped by ip:port) — mirrors the desktop
// apps' own `discovery::discover()` timeout-and-collect shape.
function discover(serviceType: string, timeoutMs: number): Promise<DiscoveredPeer[]> {
  return new Promise((resolve) => {
    const zeroconf = new Zeroconf();
    const found: DiscoveredPeer[] = [];
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      zeroconf.stop();
      zeroconf.removeDeviceListeners();
      resolve(found);
    };

    zeroconf.on('resolved', (service) => {
      const ip = resolveIpv4(service.addresses ?? []);
      if (!ip) return;
      const port = service.port;
      if (found.some((p) => p.ip === ip && p.port === port)) return;
      found.push({ name: service.name || ip, ip, port });
    });
    zeroconf.on('error', finish);

    // DNSSD is the library's recommended Android implementation —
    // NSD (the default) is flaky across manufacturers/Android versions.
    zeroconf.scan(serviceType, 'tcp', 'local.', Platform.OS === 'android' ? ImplType.DNSSD : undefined);
    setTimeout(finish, timeoutMs);
  });
}

export function discoverWorshipHub(timeoutMs = 3000): Promise<DiscoveredPeer[]> {
  return discover(WORSHIPHUB_TYPE, timeoutMs);
}

// Filters out this device's own `_whsongs._tcp` advertisement (see the
// module comment above) by ip+port together — mirroring the desktop
// app's own self-filter (src-tauri/src/server.rs's `discover_peers`),
// which matches ip+port rather than ip alone specifically because two
// different apps can share one IP on the same machine. That scenario
// doesn't really arise on a phone, but matching the stricter check costs
// nothing and keeps the two implementations doing the same thing.
export async function discoverSongsDesktopPeers(timeoutMs = 3000): Promise<DiscoveredPeer[]> {
  const [peers, myIp] = await Promise.all([discover(SONGS_TYPE, timeoutMs), Network.getIpAddressAsync().catch(() => null)]);
  if (!myIp) return peers;
  return peers.filter((p) => !(p.ip === myIp && p.port === LOCAL_SYNC_PORT));
}
