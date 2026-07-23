import { useAuth } from '@/hooks/useAuth';
import { LottieIcon } from '@/components/AnimatedIcons';
import { resetCookiePreferences } from '@/hooks/useCookieConsent';

export function PrivacyPolicy() {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="soft-card p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-6">Last updated: July 2025</p>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">1. Overview</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Neuroweave respects your privacy. This policy explains what data we collect, why we collect it,
              and how you can control your preferences.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">2. Cookies We Use</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li><span className="text-foreground font-medium">Essential:</span> authentication, session management, and security.</li>
              <li><span className="text-foreground font-medium">Preferences:</span> theme, sidebar state, and saved settings.</li>
              <li><span className="text-foreground font-medium">Analytics:</span> usage patterns to improve the learning experience.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">3. Your Choices</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can accept all cookies, reject non-essential cookies, or customize which categories you allow.
              You can change your preferences anytime in Settings.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">4. Data Retention</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We retain learning data only as long as your account is active. You can request deletion at any time.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">5. Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For privacy questions, reach out through the contact form on our website.
            </p>
          </div>
        </section>

        {user && (
          <div className="mt-8 pt-6 border-t border-border">
            <button
              onClick={() => {
                resetCookiePreferences();
                window.location.reload();
              }}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Reset Cookie Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
