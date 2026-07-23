import { createContext, useContext } from 'react';

export type CookieConsentPreferences = {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
  timestamp?: number;
};

type CookieConsentContextValue = {
  preferences: CookieConsentPreferences;
  setPreferences: (prefs: CookieConsentPreferences) => void;
  resetPreferences: () => void;
};

export const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return ctx;
}
