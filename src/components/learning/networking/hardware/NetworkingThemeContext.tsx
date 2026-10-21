'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { soundFx } from '../../../../lib/networking/audio-fx';

export type NetworkingTheme = 'cyber-glass' | 'midnight-minimal';

interface NetworkingThemeContextType {
  theme: NetworkingTheme;
  setTheme: (theme: NetworkingTheme) => void;
  toggleTheme: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  // Dynamic Glassmorphic Styles
  panelClass: string;
  cardClass: string;
  badgeClass: string;
  glowColor: string;
}

const NetworkingThemeContext = createContext<NetworkingThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'click_networking_theme';
const SOUND_STORAGE_KEY = 'click_networking_sound';

export const NetworkingThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<NetworkingTheme>('cyber-glass');
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as NetworkingTheme;
      if (savedTheme === 'cyber-glass' || savedTheme === 'midnight-minimal') {
        setThemeState(savedTheme);
      }
      const savedSound = localStorage.getItem(SOUND_STORAGE_KEY);
      if (savedSound !== null) {
        const enabled = savedSound === 'true';
        setSoundEnabledState(enabled);
        soundFx.setMuted(!enabled);
      }
    }
  }, []);

  const setTheme = (newTheme: NetworkingTheme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }
  };

  const toggleTheme = () => {
    const next = theme === 'cyber-glass' ? 'midnight-minimal' : 'cyber-glass';
    setTheme(next);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabledState(next);
    soundFx.setMuted(!next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SOUND_STORAGE_KEY, String(next));
    }
  };

  const isCyber = theme === 'cyber-glass';

  const panelClass = isCyber
    ? 'bg-slate-950/75 border border-slate-700/60 shadow-2xl backdrop-blur-xl shadow-cyan-950/20'
    : 'bg-zinc-950/95 border border-white/10 shadow-2xl backdrop-blur-2xl shadow-black/80';

  const cardClass = isCyber
    ? 'bg-slate-900/70 border border-slate-700/50 shadow-lg backdrop-blur-md hover:border-cyan-500/40 transition-all'
    : 'bg-zinc-900/80 border border-zinc-800/80 shadow-md backdrop-blur-md hover:border-zinc-700 transition-all';

  const badgeClass = isCyber
    ? 'bg-cyan-950/50 border border-cyan-500/40 text-cyan-300'
    : 'bg-zinc-900 border border-zinc-700 text-zinc-300';

  const glowColor = isCyber ? 'rgba(6, 182, 212, 0.4)' : 'rgba(255, 255, 255, 0.2)';

  return (
    <NetworkingThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        soundEnabled,
        toggleSound,
        panelClass,
        cardClass,
        badgeClass,
        glowColor,
      }}
    >
      {children}
    </NetworkingThemeContext.Provider>
  );
};

export const useNetworkingTheme = () => {
  const context = useContext(NetworkingThemeContext);
  if (!context) {
    // Graceful fallback if outside provider
    return {
      theme: 'cyber-glass' as NetworkingTheme,
      setTheme: () => {},
      toggleTheme: () => {},
      soundEnabled: true,
      toggleSound: () => {},
      panelClass: 'bg-slate-950/75 border border-slate-700/60 shadow-2xl backdrop-blur-xl',
      cardClass: 'bg-slate-900/70 border border-slate-700/50 shadow-lg backdrop-blur-md',
      badgeClass: 'bg-cyan-950/50 border border-cyan-500/40 text-cyan-300',
      glowColor: 'rgba(6, 182, 212, 0.4)',
    };
  }
  return context;
};
