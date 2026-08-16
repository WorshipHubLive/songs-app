import { Platform } from 'react-native';

// Getters, not plain values: `import * as Device from 'expo-device'`
// (in this file AND in local-sync-device.ts) goes through babel's
// `_interopRequireWildcard`, which builds a fresh wrapper object per
// import site by copying property descriptors — a plain-value mock
// would get snapshotted at import time into two independent copies, so
// mutating `mockDevice.deviceName` here after the fact wouldn't be
// visible from local-sync-device.ts's own copy. A getter's descriptor
// carries the function itself, not a snapshotted value, so every
// wrapper copy still reads through to these same closure variables.
let mockDeviceName: string | null = null;
let mockModelName: string | null = null;
jest.mock('expo-device', () => ({
  get deviceName() {
    return mockDeviceName;
  },
  get modelName() {
    return mockModelName;
  },
}));

import { LOCAL_SYNC_PORT, localSyncDeviceName } from './local-sync-device';

describe('localSyncDeviceName', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Platform.OS = originalOS;
    mockDeviceName = null;
    mockModelName = null;
  });

  it('uses the model name on iOS', () => {
    Platform.OS = 'ios';
    mockModelName = 'iPhone 15 Pro';
    expect(localSyncDeviceName()).toBe('iPhone 15 Pro (iOS)');
  });

  it("ignores deviceName on iOS even if set — it's the useless generic string without a restricted Apple entitlement", () => {
    Platform.OS = 'ios';
    mockDeviceName = 'iPhone';
    mockModelName = 'iPhone 15 Pro';
    expect(localSyncDeviceName()).toBe('iPhone 15 Pro (iOS)');
  });

  it('prefers deviceName over modelName on Android', () => {
    Platform.OS = 'android';
    mockDeviceName = "Fernando's Pixel";
    mockModelName = 'Pixel 8';
    expect(localSyncDeviceName()).toBe("Fernando's Pixel (Android)");
  });

  it('falls back to modelName on Android when deviceName is unavailable', () => {
    Platform.OS = 'android';
    mockModelName = 'Pixel 8';
    expect(localSyncDeviceName()).toBe('Pixel 8 (Android)');
  });

  it('falls back to the generic label when nothing is available', () => {
    Platform.OS = 'ios';
    expect(localSyncDeviceName()).toBe('Songs Mobile (iOS)');
  });
});

describe('LOCAL_SYNC_PORT', () => {
  it('matches the desktop app’s own Local Sync server port', () => {
    expect(LOCAL_SYNC_PORT).toBe(47822);
  });
});
