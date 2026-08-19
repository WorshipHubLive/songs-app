import Storage from 'expo-sqlite/kv-store';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

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
  // The Service Slides screen's ([songId]/slides.tsx) language choices —
  // mirrors standalone/songs' settings.tsx `service` block. The queue
  // itself lives in the `songs` table (inService/serviceOrder columns),
  // not here; only the per-song language picks need separate storage.
  service: {
    // The whole-song language chosen on the Service Slides screen, keyed
    // by song id — absent means "use the song's own base language".
    // Persisted so it survives navigating away, AND is what actually
    // gets sent to WorshipHub (see send-to-worshiphub-sheet.tsx).
    languages: Record<number, string>;
    // Per-slide override on top of the song-level `languages` choice
    // above — `slideOverrides[songId][slideIndex]`. Absent for a given
    // slide falls back to that song's `languages` entry.
    slideOverrides: Record<number, Record<number, string>>;
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  profile: { name: '', avatarUri: '' },
  search: { tavilyApiKey: '' },
  worshiphub: { linked: false, baseUrl: null, name: '', token: null },
  service: { languages: {}, slideOverrides: {} },
};

const STORAGE_KEY = 'app-settings';

interface AppSettingsContextValue {
  settings: AppSettings;
  loaded: boolean;
  updateProfile: (patch: Partial<AppSettings['profile']>) => void;
  updateSearch: (patch: Partial<AppSettings['search']>) => void;
  updateWorshipHub: (patch: Partial<AppSettings['worshiphub']>) => void;
  /** The whole-song language choice on the Service Slides screen. */
  setServiceSongLanguage: (songId: number, language: string) => void;
  /** A single slide's language override — `language: null` clears it
   * (falls back to the song-level choice above). */
  setServiceSlideOverride: (songId: number, slideIndex: number, language: string | null) => void;
  /** Drops a song's language/slide-override choices — called when it
   * leaves the Service queue, so re-adding it later starts fresh instead
   * of resurrecting a stale pick. */
  clearServiceSongSettings: (songId: number) => void;
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
              service: { ...DEFAULT_SETTINGS.service, ...parsed.service },
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

  const setServiceSongLanguage = (songId: number, language: string) =>
    persist({ ...settings, service: { ...settings.service, languages: { ...settings.service.languages, [songId]: language } } });

  const setServiceSlideOverride = (songId: number, slideIndex: number, language: string | null) => {
    const current = { ...(settings.service.slideOverrides[songId] ?? {}) };
    if (language === null) delete current[slideIndex];
    else current[slideIndex] = language;
    persist({
      ...settings,
      service: { ...settings.service, slideOverrides: { ...settings.service.slideOverrides, [songId]: current } },
    });
  };

  const clearServiceSongSettings = (songId: number) => {
    const languages = { ...settings.service.languages };
    delete languages[songId];
    const slideOverrides = { ...settings.service.slideOverrides };
    delete slideOverrides[songId];
    persist({ ...settings, service: { languages, slideOverrides } });
  };

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        loaded,
        updateProfile,
        updateSearch,
        updateWorshipHub,
        setServiceSongLanguage,
        setServiceSlideOverride,
        clearServiceSongSettings,
      }}
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
