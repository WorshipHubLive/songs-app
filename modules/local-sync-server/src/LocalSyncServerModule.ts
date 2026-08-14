import { NativeModule, requireNativeModule } from 'expo';
import type { LocalSyncServerEvents } from './LocalSyncServer.types';

declare class LocalSyncServerModule extends NativeModule<LocalSyncServerEvents> {
  start(serviceName: string, port: number): void;
  stop(): void;
  respond(requestId: string, status: number, body: string): void;
}

export default requireNativeModule<LocalSyncServerModule>('LocalSyncServer');
