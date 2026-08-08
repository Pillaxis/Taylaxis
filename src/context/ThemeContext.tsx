import React, { createContext, useContext, useState, useEffect } from 'react';
import type { TextScale } from '../types';

interface ThemeContextType {
  textScale: TextScale;
  setTextScale: (scale: TextScale) => void;
  brandColor: string;
  setBrandColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [textScale, setTextScale] = useState<TextScale>('medium');
  const [brandColor, setBrandColor] = useState<string>('#7C3AED');

  useEffect(() => {
    const root = document.documentElement;
    let scaleVal = '1';
    if (textScale === 'small') scaleVal = '0.9';
    if (textScale === 'large') scaleVal = '1.1';
    root.style.setProperty('--font-scale', scaleVal);
  }, [textScale]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-500', brandColor);
  }, [brandColor]);

  return (
    <ThemeContext.Provider
      value={{
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
