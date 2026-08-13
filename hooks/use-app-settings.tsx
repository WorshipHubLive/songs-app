import Storage from 'expo-sqlite/kv-store';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface AppSettings {
  profile: {
    name: string;
    avatarUri: string;
  };
  search: {
    // Tavily (tavily.com) — free tier is 1000 searches/month, used as a
    // fallback lyrics source when LRCLIB/lyrics.ovh don't have a song
    // (see lib/online-search.ts's stage 3). Empty disables that stage.
    tavilyApiKey: string;
  };
  worshiphub: {
    linked: boolean;
    baseUrl: string | null;
    name: string;
    // Pairing token from WorshipHub's human-approval flow — required on
    // every send; see lib/worshiphub-client.ts.
    token: string | null;
  };
  localSyncPeer: {
    baseUrl: string | null;
  };
  cloud: {
    url: string;
    anonKey: string;
    lastSyncedAt: string;
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  profile: { name: '', avatarUri: '' },
  search: { tavilyApiKey: '' },
  worshiphub: { linked: false, baseUrl: null, name: '', token: null },
  localSyncPeer: { baseUrl: null },
  cloud: { url: '', anonKey: '', lastSyncedAt: '' },
};

const STORAGE_KEY = 'app-settings';

interface AppSettingsContextValue {
  settings: AppSettings;
  loaded: boolean;
  updateProfile: (patch: Partial<AppSettings['profile']>) => void;
  updateSearch: (patch: Partial<AppSettings['search']>) => void;
  updateWorshipHub: (patch: Partial<AppSettings['worshiphub']>) => void;
  updateLocalSyncPeer: (patch: Partial<AppSettings['localSyncPeer']>) => void;
  updateCloud: (patch: Partial<AppSettings['cloud']>) => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Storage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Partial<AppSettings>;
            setSettings({
              profile: { ...DEFAULT_SETTINGS.profile, ...parsed.profile },
              search: { ...DEFAULT_SETTINGS.search, ...parsed.search },
              worshiphub: { ...DEFAULT_SETTINGS.worshiphub, ...parsed.worshiphub },
              localSyncPeer: { ...DEFAULT_SETTINGS.localSyncPeer, ...parsed.localSyncPeer },
              cloud: { ...DEFAULT_SETTINGS.cloud, ...parsed.cloud },
            });
          } catch {
            // corrupted blob — fall back to defaults
          }
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = (next: AppSettings) => {
    setSettings(next);
    void Storage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const updateProfile = (patch: Partial<AppSettings['profile']>) =>
    persist({ ...settings, profile: { ...settings.profile, ...patch } });
  const updateSearch = (patch: Partial<AppSettings['search']>) =>
    persist({ ...settings, search: { ...settings.search, ...patch } });
  const updateWorshipHub = (patch: Partial<AppSettings['worshiphub']>) =>
    persist({ ...settings, worshiphub: { ...settings.worshiphub, ...patch } });
  const updateLocalSyncPeer = (patch: Partial<AppSettings['localSyncPeer']>) =>
    persist({ ...settings, localSyncPeer: { ...settings.localSyncPeer, ...patch } });
  const updateCloud = (patch: Partial<AppSettings['cloud']>) =>
    persist({ ...settings, cloud: { ...settings.cloud, ...patch } });

  return (
    <AppSettingsContext.Provider
      value={{ settings, loaded, updateProfile, updateSearch, updateWorshipHub, updateLocalSyncPeer, updateCloud }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used within AppSettingsProvider');
  return ctx;
}
