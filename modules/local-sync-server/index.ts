import type { EventSubscription } from 'expo-modules-core';
import LocalSyncServerModule from './src/LocalSyncServerModule';
import type { LocalSyncRequestEvent } from './src/LocalSyncServer.types';

export type { LocalSyncRequestEvent };

/** Starts listening on `port` and advertising `serviceName` over mDNS as
 * `_whsongs._tcp` — the desktop Songs app then discovers and pushes to
 * this device exactly like it would another desktop instance. Call once
 * (e.g. from the root layout) and leave running for the app's lifetime;
 * calling again restarts with the new name/port. */
export function startLocalSyncServer(serviceName: string, port: number): void {
  LocalSyncServerModule.start(serviceName, port);
}

export function stopLocalSyncServer(): void {
  LocalSyncServerModule.stop();
}

/** Completes the request identified by `requestId` — must be called
 * exactly once per `onRequest` event, or that connection hangs open
 * until the desktop's own request timeout gives up on it. */
export function respondToLocalSyncRequest(requestId: string, status: number, body: string): void {
  LocalSyncServerModule.respond(requestId, status, body);
}

/** Fires once per incoming HTTP request — GET /identity or POST
 * /songs/import, same routes standalone/songs' own microserver answers
 * (see src-tauri/src/server.rs). The listener owns turning each event
 * into a `respondToLocalSyncRequest` call; see
 * hooks/use-local-sync-server.ts for the actual route handling. */
export function addLocalSyncRequestListener(listener: (event: LocalSyncRequestEvent) => void): EventSubscription {
  return LocalSyncServerModule.addListener('onRequest', listener);
}
