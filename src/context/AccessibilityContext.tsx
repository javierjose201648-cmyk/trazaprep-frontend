import { createContext, useContext, useEffect, useState } from "react";

interface A11ySettings {
  largeText: boolean;
  daltonismo: boolean;
  altoContraste: boolean;
}

interface A11yCtx {
  settings: A11ySettings;
  toggle: (key: keyof A11ySettings) => void;
}

const STORAGE_KEY = "trazaprep-a11y";
const DEFAULTS: A11ySettings = {
  largeText: false,
  daltonismo: false,
  altoContraste: false,
};

const Ctx = createContext<A11yCtx>({ settings: DEFAULTS, toggle: () => {} });

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<A11ySettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("a11y-text-lg", settings.largeText);
    root.classList.toggle("a11y-daltonismo", settings.daltonismo);
    root.classList.toggle("a11y-contraste", settings.altoContraste);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const toggle = (key: keyof A11ySettings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return <Ctx.Provider value={{ settings, toggle }}>{children}</Ctx.Provider>;
}

export const useAccessibility = () => useContext(Ctx);
