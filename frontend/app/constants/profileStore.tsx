/**
 * Profile store using React Context — the reliable way to share state across screens.
 *
 * State lives in ONE provider at the app root. Every screen that calls useProfileStore()
 * reads from the same context and re-renders the instant the state changes. This avoids
 * the module-level-variable problem (where Metro/Fast Refresh could create disconnected
 * copies, so one screen updated while another didn't).
 */
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { API_URL } from './api';

export const CHILD_ID = 'child_demo_01';

type ProfileData = {
  display_name: string;
  xp: number;
  level: number;
  streak: number;
  completed_quests: string[];
  quests_today: number;
};

const DEFAULT: ProfileData = {
  display_name: 'Explorer', xp: 0, level: 1, streak: 0,
  completed_quests: [], quests_today: 0,
};

type ProfileContextType = ProfileData & {
  refresh: () => void;
  setName: (name: string) => void;
  reset: () => void;
  setStats: (partial: Partial<ProfileData>) => void;
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProfileData>(DEFAULT);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/profile/${CHILD_ID}`);
      const d = await r.json();
      setData({ ...DEFAULT, ...d });
    } catch { /* keep last known values */ }
  }, []);

  // Optimistic + instant: updates the UI immediately, then syncs to the server.
  const setName = useCallback(async (name: string) => {
    const clean = name.trim() || 'Explorer';
    setData(prev => ({ ...prev, display_name: clean }));
    try {
      await fetch(`${API_URL}/set-name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: CHILD_ID, display_name: clean }),
      });
    } catch { /* ignore */ }
  }, []);

  const reset = useCallback(async () => {
    setData(prev => ({ ...prev, xp: 0, level: 1, streak: 0, completed_quests: [], quests_today: 0 }));
    try {
      await fetch(`${API_URL}/reset/${CHILD_ID}`, { method: 'POST' });
    } catch { /* ignore */ }
    refresh();
  }, [refresh]);

  // Push known-fresh values (e.g. from the /complete-quest response) instantly.
  const setStats = useCallback((partial: Partial<ProfileData>) => {
    setData(prev => ({ ...prev, ...partial }));
  }, []);

  // Load once when the app starts.
  useEffect(() => { refresh(); }, [refresh]);

  return (
    <ProfileContext.Provider value={{ ...data, refresh, setName, reset, setStats }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileStore(): ProfileContextType {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    // Safe fallback so nothing crashes if used outside the provider.
    return {
      ...DEFAULT,
      refresh: () => {},
      setName: () => {},
      reset: () => {},
      setStats: () => {},
    };
  }
  return ctx;
}
