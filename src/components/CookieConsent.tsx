import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  saveCookiePreferences,
  resetCookiePreferences,
  DEFAULT_COOKIE_PREFERENCES,
  type CookiePreferences,
} from '@/hooks/useCookieConsent';

interface CookieConsentProps {
  onNavigate?: (page: string) => void;
}

export function CookieConsent({ onNavigate }: CookieConsentProps) {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>(DEFAULT_COOKIE_PREFERENCES);

  useEffect(() => {
    const existing = localStorage.getItem('neuroweave_cookie_consent');
    if (!existing) {
      setVisible(true);
    }
  }, []);

  const handleSave = useCallback(
    (choice: 'all' | 'essential' | 'custom') => {
      const payload = {
        essential: true,
        analytics: choice === 'essential' ? false : prefs.analytics,
        preferences: choice === 'essential' ? false : prefs.preferences,
      };

      saveCookiePreferences(payload, choice);
      setVisible(false);
    },
    [prefs.analytics, prefs.preferences]
  );

  const handleReject = useCallback(() => {
    saveCookiePreferences(
      {
        essential: true,
        analytics: false,
        preferences: false,
      },
      'essential'
    );
    setVisible(false);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-xl z-50"
        >
          <div className="glass-panel-strong border border-border rounded-2xl p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="text-foreground font-semibold mb-1">Cookie Preferences</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Neuroweave uses cookies to keep you signed in, remember your preferences,
                  and understand how learners use the platform. Essential cookies are always active.
                  <button
                    onClick={() => onNavigate?.('privacy')}
                    className="text-primary hover:underline ml-1"
                  >
                    Privacy Policy
                  </button>
                </p>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-3">
                        <ToggleRow
                          label="Essential"
                          description="Authentication, security, and basic app functionality. Cannot be disabled."
                          checked
                          disabled
                        />
                        <ToggleRow
                          label="Analytics"
                          description="Helps us understand usage so we can improve the learning experience."
                          checked={prefs.analytics}
                          onChange={(checked) => setPrefs((prev) => ({ ...prev, analytics: checked }))}
                        />
                        <ToggleRow
                          label="Preferences"
                          description="Remembers your theme, sidebar state, and saved settings."
                          checked={prefs.preferences}
                          onChange={(checked) => setPrefs((prev) => ({ ...prev, preferences: checked }))}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReject}
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Reject Non-Essential
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSave('all')}
                className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25"
              >
                Accept All
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDetails((prev) => !prev)}
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1"
              >
                {showDetails ? 'Less' : 'Customize'}
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </motion.button>

              {showDetails && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSave('custom')}
                  className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25"
                >
                  Save Preferences
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-muted'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
