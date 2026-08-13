import { Platform } from 'react-native';
import Zeroconf, { ImplType } from 'react-native-zeroconf';

export interface DiscoveredPeer {
  name: string;
  ip: string;
  port: number;
}

// Same mDNS (RFC 6762/6763) service types the desktop apps advertise —
// see ScreenWorship's src/local_server.rs (`_worshiphub._tcp.local.`,
// port 8787) and standalone/songs/src-tauri/src/server.rs
// (`_whsongs._tcp.local.`, port 47822). Nothing changes on those apps:
// they already announce themselves this way for the Tauri desktop build
// to browse, this just adds a second browser. This app never advertises
// its own service — it's a client here, not a peer other apps discover.
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

export function discoverSongsDesktopPeers(timeoutMs = 3000): Promise<DiscoveredPeer[]> {
  return discover(SONGS_TYPE, timeoutMs);
}
