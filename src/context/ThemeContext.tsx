import React, { createContext, useContext, useState, useEffect } from 'react';
import type { TextScale, ThemeMode } from '../types';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  textScale: TextScale;
  setTextScale: (scale: TextScale) => void;
  brandColor: string;
  setBrandColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('taylaxis_theme_mode') as ThemeMode) || 'system';
  });

  const [textScale, setTextScaleState] = useState<TextScale>(() => {
    return (localStorage.getItem('taylaxis_text_scale') as TextScale) || 'medium';
  });

  const [brandColor, setBrandColorState] = useState<string>(() => {
    return localStorage.getItem('taylaxis_brand_color') || '#7C3AED';
  });

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('taylaxis_theme_mode', mode);
  };

  const setTextScale = (scale: TextScale) => {
    setTextScaleState(scale);
    localStorage.setItem('taylaxis_text_scale', scale);
  };

  const setBrandColor = (color: string) => {
    setBrandColorState(color);
    localStorage.setItem('taylaxis_brand_color', color);
  };

  // Effect for light / dark / system theme
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark =
        themeMode === 'dark' ||
        (themeMode === 'system' && mediaQuery.matches);

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    const handleChange = () => {
      if (themeMode === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  // Effect for font scale
  useEffect(() => {
    const root = document.documentElement;
    let scaleVal = '1';
    if (textScale === 'small') scaleVal = '0.9';
    if (textScale === 'large') scaleVal = '1.1';
    root.style.setProperty('--font-scale', scaleVal);
  }, [textScale]);

  // Effect for brand color
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-500', brandColor);
  }, [brandColor]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        textScale,
        setTextScale,
        brandColor,
        setBrandColor,
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
