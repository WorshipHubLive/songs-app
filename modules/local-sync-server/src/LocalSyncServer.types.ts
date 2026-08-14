export type LocalSyncRequestEvent = {
  requestId: string;
  method: string;
  path: string;
  body: string;
};

export type LocalSyncServerEvents = {
  onRequest: (event: LocalSyncRequestEvent) => void;
};
