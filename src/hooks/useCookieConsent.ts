const CONSENT_STORAGE_KEY = 'neuroweave_cookie_consent';

export type CookiePreferences = {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
};

export type ConsentChoice = 'all' | 'essential' | 'custom';

export function loadCookiePreferences(): CookiePreferences & { choice: ConsentChoice; timestamp: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCookiePreferences(prefs: CookiePreferences, choice: ConsentChoice = 'custom') {
  const payload = { ...prefs, choice, timestamp: Date.now() };
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function hasConsented(): boolean {
  return loadCookiePreferences() !== null;
}

export function resetCookiePreferences() {
  localStorage.removeItem(CONSENT_STORAGE_KEY);
}

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  preferences: false,
};
