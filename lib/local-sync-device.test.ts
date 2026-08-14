import { Platform } from 'react-native';
import { LOCAL_SYNC_PORT, localSyncDeviceName } from './local-sync-device';

describe('localSyncDeviceName', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Platform.OS = originalOS;
  });

  it('labels the device as iOS when running on iOS', () => {
    Platform.OS = 'ios';
    expect(localSyncDeviceName()).toBe('Songs Mobile (iOS)');
  });

  it('labels the device as Android when running on Android', () => {
    Platform.OS = 'android';
    expect(localSyncDeviceName()).toBe('Songs Mobile (Android)');
  });
});

describe('LOCAL_SYNC_PORT', () => {
  it('matches the desktop app’s own Local Sync server port', () => {
    expect(LOCAL_SYNC_PORT).toBe(47822);
  });
});
