import { NativeModule, registerWebModule } from 'expo';
import type { LocalSyncServerEvents } from './LocalSyncServer.types';

// No-op — a browser tab can't open a listening TCP socket. The web build
// keeps using the polling approach (see standalone/songs'
// useLocalSyncHeartbeat) instead of this module.
class LocalSyncServerModule extends NativeModule<LocalSyncServerEvents> {
  start(_serviceName: string, _port: number): void {}
  stop(): void {}
  respond(_requestId: string, _status: number, _body: string): void {}
}

export default registerWebModule(LocalSyncServerModule, 'LocalSyncServerModule');
