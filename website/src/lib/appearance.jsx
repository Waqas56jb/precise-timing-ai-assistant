import { createContext, useContext, useEffect, useState } from 'react';
import { resolveApiBase } from './apiBase.js';

export function applyAppearance(settings) {
  if (typeof document === 'undefined') return;
  const a = settings?.appearance_json || {};
  const root = document.documentElement;
  if (a.websitePrimary) {
    root.style.setProperty('--pt-blue-700', a.websitePrimary);
    root.style.setProperty('--pt-blue-600', a.websitePrimary);
    root.style.setProperty('--pt-blue-500', a.websitePrimary);
  }
  if (a.websiteDeep) {
    root.style.setProperty('--pt-blue-950', a.websiteDeep);
    root.style.setProperty('--pt-blue-900', a.websiteDeep);
    root.style.setProperty('--pt-blue-800', a.websiteDeep);
  }
  if (a.websiteGold) {
    root.style.setProperty('--pt-gold', a.websiteGold);
  }
}

const AppearanceContext = createContext({ settings: null, appearance: {} });

export function AppearanceProvider({ children }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch(`${resolveApiBase()}/api/business-settings/public`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setSettings(data);
        applyAppearance(data);
      })
      .catch(() => {});
  }, []);

  return (
    <AppearanceContext.Provider
      value={{ settings, appearance: settings?.appearance_json || {} }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}
