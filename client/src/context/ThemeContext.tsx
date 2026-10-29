import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemePalette =
  | 'rapido-yellow'
  | 'ocean-blue'
  | 'emerald-green'
  | 'midnight-purple'
  | 'sunset-orange'
  | 'premium-dark'
  | 'minimal-light';

export interface ThemeOption {
  id: ThemePalette;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  isDark: boolean;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'rapido-yellow',
    name: 'Rapido Yellow & Dark',
    description: 'Original Indian bike taxi signature styling with electric yellow and charcoal.',
    primaryColor: '#FFD500',
    secondaryColor: '#151515',
    bgColor: '#FAFAFA',
    isDark: false,
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue & White',
    description: 'Refreshing coastal blue with crisp high-contrast readability.',
    primaryColor: '#0284C7',
    secondaryColor: '#0F172A',
    bgColor: '#F0F9FF',
    isDark: false,
  },
  {
    id: 'emerald-green',
    name: 'Emerald Green & Cream',
    description: 'Eco-mobility green tone inspired by clean EV city transit.',
    primaryColor: '#059669',
    secondaryColor: '#064E3B',
    bgColor: '#F7FBF8',
    isDark: false,
  },
  {
    id: 'midnight-purple',
    name: 'Midnight Purple & Dark',
    description: 'Deep violet neon night-rider palette optimized for late-night rides.',
    primaryColor: '#8B5CF6',
    secondaryColor: '#1E1035',
    bgColor: '#0F0A1A',
    isDark: true,
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange & White',
    description: 'Vibrant saffron warm citrus tones with punchy accents.',
    primaryColor: '#F97316',
    secondaryColor: '#1C1917',
    bgColor: '#FFF7ED',
    isDark: false,
  },
  {
    id: 'premium-dark',
    name: 'Premium Dark Mode',
    description: 'Sleek OLED pitch-black interface with gold accents and maximum battery saving.',
    primaryColor: '#FFD500',
    secondaryColor: '#FFFFFF',
    bgColor: '#0D0D0D',
    isDark: true,
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light Mode',
    description: 'Clean Scandinavian editorial layout with calming modern teal.',
    primaryColor: '#0D9488',
    secondaryColor: '#134E4A',
    bgColor: '#FFFFFF',
    isDark: false,
  },
];

interface ThemeContextType {
  theme: ThemePalette;
  setTheme: (theme: ThemePalette) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (val: boolean) => void;
  currentThemeMeta: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemePalette>(() => {
    const saved = localStorage.getItem('ridex_theme');
    if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
      return saved as ThemePalette;
    }
    return 'rapido-yellow';
  });

  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    return localStorage.getItem('ridex_reduced_motion') === 'true';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const setTheme = (newTheme: ThemePalette) => {
    setThemeState(newTheme);
    localStorage.setItem('ridex_theme', newTheme);
  };

  const setReducedMotion = (val: boolean) => {
    setReducedMotionState(val);
    localStorage.setItem('ridex_reduced_motion', String(val));
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    const meta = THEME_OPTIONS.find((t) => t.id === theme);
    if (meta?.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }, [theme, reducedMotion]);

  const currentThemeMeta = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        reducedMotion,
        setReducedMotion,
        isSettingsOpen,
        setIsSettingsOpen,
        currentThemeMeta,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
