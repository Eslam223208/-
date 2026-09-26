import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Theme, darkTheme, lightTheme } from './theme';
import { UserNeeds } from './types';

interface AppContextValue {
  theme: Theme;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  needs: UserNeeds | null;
  saveNeeds: (n: UserNeeds) => void;
  clearNeeds: () => void;
  ready: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);
const FAV_KEY = '@aqari/favorites';
const NEEDS_KEY = '@aqari/needs';

export function AppProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const [favorites, setFavorites] = useState<string[]>([]);
  const [needs, setNeeds] = useState<UserNeeds | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [f, n] = await Promise.all([AsyncStorage.getItem(FAV_KEY), AsyncStorage.getItem(NEEDS_KEY)]);
        if (f) setFavorites(JSON.parse(f));
        if (n) setNeeds(JSON.parse(n));
      } catch {
        // ignore
      }
      setReady(true);
    })();
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      AsyncStorage.setItem(FAV_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const saveNeeds = (n: UserNeeds) => {
    setNeeds(n);
    AsyncStorage.setItem(NEEDS_KEY, JSON.stringify(n)).catch(() => {});
  };

  const clearNeeds = () => {
    setNeeds(null);
    AsyncStorage.removeItem(NEEDS_KEY).catch(() => {});
  };

  const value = useMemo(
    () => ({
      theme,
      favorites,
      toggleFavorite,
      isFavorite: (id: string) => favorites.includes(id),
      needs,
      saveNeeds,
      clearNeeds,
      ready,
    }),
    [theme, favorites, needs, ready]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
