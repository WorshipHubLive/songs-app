import { Platform } from 'react-native';

// `react-native-zeroconf`'s real `Zeroconf` extends Node's EventEmitter
// and only adds `scan`/`stop`/`removeDeviceListeners` (which call into
// the native module) — this mock keeps the EventEmitter behavior (so
// `discover()`'s own `.on('resolved', ...)` still works) and stubs the
// three methods that would otherwise reach for a native module that
// doesn't exist under Jest.
//
// Defined INSIDE the factory deliberately, not as a top-level class
// referenced from it: `jest.mock(...)` calls are hoisted above every
// other statement in the file INCLUDING this file's own
// `import { discoverSongsDesktopPeers } from './discovery'` — which
// means `./discovery`'s own `require('react-native-zeroconf')` (and so
// this factory) runs before a separately-declared top-level class
// statement would have executed. `MockZeroconf.instances` lets each
// test grab the instance `discover()` just constructed and
// `.emit('resolved', …)` on it, simulating an mDNS hit.
jest.mock('react-native-zeroconf', () => {
  const EventEmitter = require('node:events').EventEmitter;
  class MockZeroconf extends EventEmitter {
    static instances: MockZeroconf[] = [];
    scan = jest.fn();
    stop = jest.fn();
    removeDeviceListeners = jest.fn();
    constructor() {
      super();
      MockZeroconf.instances.push(this);
    }
  }
  return { __esModule: true, default: MockZeroconf, ImplType: { DNSSD: 'DNSSD', NSD: 'NSD' } };
});

const mockGetIpAddressAsync = jest.fn<Promise<string>, []>();
jest.mock('expo-network', () => ({ getIpAddressAsync: () => mockGetIpAddressAsync() }));

jest.mock('expo-device', () => ({ deviceName: null, modelName: null }));

import ZeroconfDefault from 'react-native-zeroconf';
import { discoverSongsDesktopPeers, discoverWorshipHub } from './discovery';
import { LOCAL_SYNC_PORT } from './local-sync-device';

// biome-ignore lint/suspicious/noExplicitAny: reaching into the mock's own static instance-tracking, not part of the real Zeroconf type
const MockZeroconf = ZeroconfDefault as any;

function resolvePeer(
  instance: InstanceType<typeof MockZeroconf>,
  service: { name?: string; addresses?: string[]; port: number }
) {
  instance.emit('resolved', service);
}

// The instance `discover()` just constructed for the call under test —
// always the last one pushed, not the first, since the array isn't
// reset between individual `it()`s (only between describe blocks below).
function latestZeroconfInstance(): InstanceType<typeof MockZeroconf> {
  return MockZeroconf.instances[MockZeroconf.instances.length - 1];
}

const originalOS = Platform.OS;

beforeEach(() => {
  MockZeroconf.instances.length = 0;
  mockGetIpAddressAsync.mockReset();
});

afterEach(() => {
  Platform.OS = originalOS;
});

describe('discoverSongsDesktopPeers', () => {
  it("filters out this device's own advertisement (same ip AND the Local Sync port)", async () => {
    mockGetIpAddressAsync.mockResolvedValue('192.168.1.50');
    const promise = discoverSongsDesktopPeers(50);

    const zeroconf = latestZeroconfInstance();
    resolvePeer(zeroconf, { name: 'Songs Mobile (iOS)', addresses: ['192.168.1.50'], port: LOCAL_SYNC_PORT });
    resolvePeer(zeroconf, { name: "Fernando's MacBook Pro", addresses: ['192.168.1.42'], port: LOCAL_SYNC_PORT });

    const peers = await promise;
    expect(peers).toEqual([{ name: "Fernando's MacBook Pro", ip: '192.168.1.42', port: LOCAL_SYNC_PORT }]);
  });

  it('keeps a same-IP result on a different port (another app on the same host, not this device announcing itself)', async () => {
    mockGetIpAddressAsync.mockResolvedValue('192.168.1.50');
    const promise = discoverSongsDesktopPeers(50);

    const zeroconf = latestZeroconfInstance();
    resolvePeer(zeroconf, { name: 'Some Other App', addresses: ['192.168.1.50'], port: 9999 });

    const peers = await promise;
    expect(peers).toEqual([{ name: 'Some Other App', ip: '192.168.1.50', port: 9999 }]);
  });

  it('returns everything found when the local IP is unavailable, instead of filtering blindly', async () => {
    mockGetIpAddressAsync.mockRejectedValue(new Error('no network'));
    const promise = discoverSongsDesktopPeers(50);

    const zeroconf = latestZeroconfInstance();
    resolvePeer(zeroconf, { name: 'Desktop', addresses: ['192.168.1.42'], port: LOCAL_SYNC_PORT });

    const peers = await promise;
    expect(peers).toEqual([{ name: 'Desktop', ip: '192.168.1.42', port: LOCAL_SYNC_PORT }]);
  });
});

describe('discoverWorshipHub', () => {
  it('never self-filters — this app never advertises _worshiphub._tcp, so nothing found can be it', async () => {
    const promise = discoverWorshipHub(50);
    const zeroconf = latestZeroconfInstance();
    resolvePeer(zeroconf, { name: 'WorshipHub', addresses: ['192.168.1.42'], port: 8787 });

    const peers = await promise;
    expect(peers).toEqual([{ name: 'WorshipHub', ip: '192.168.1.42', port: 8787 }]);
    expect(mockGetIpAddressAsync).not.toHaveBeenCalled();
  });
});
