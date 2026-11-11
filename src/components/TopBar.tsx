import { LogIn, LogOut } from 'lucide-react';
import { Language, TranslationContent } from '../i18n/translations';
import { UserProfile } from '../utils/shopManager';

interface TopBarProps {
  language: Language;
  content: TranslationContent;
  userProfile: UserProfile | null;
  onLanguageChange: (lang: Language) => void;
  onBrandClick: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export function TopBar({
  language,
  content,
  userProfile,
  onLanguageChange,
  onBrandClick,
  onOpenAuth,
  onLogout,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 w-full border-b border-[var(--color-border)] bg-[var(--color-canvas)]">
      <div className="mx-auto flex w-full max-w-[500px] items-center justify-between gap-2 px-4 py-3 sm:px-5">
        <button
          type="button"
          id="brand-home-btn"
          onClick={onBrandClick}
          className="text-xl font-bold tracking-tight text-[var(--color-primary)] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] rounded-lg py-1"
        >
          {content.appName}
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <div
            role="group"
            aria-label={content.languageLabel}
            className="inline-flex items-center rounded-2xl bg-[var(--color-surface)] p-1 border border-[var(--color-border)] shrink-0"
          >
            <button
              type="button"
              id="lang-toggle-ur"
              onClick={() => onLanguageChange('ur')}
              aria-pressed={language === 'ur'}
              lang="ur"
              dir="rtl"
              className={`font-urdu min-h-[42px] min-w-[60px] px-2.5 py-1 text-base font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
                language === 'ur'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {content.urduLabel}
            </button>
            <button
              type="button"
              id="lang-toggle-en"
              onClick={() => onLanguageChange('en')}
              aria-pressed={language === 'en'}
              lang="en"
              dir="ltr"
              className={`font-english min-h-[42px] min-w-[68px] px-2.5 py-1 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
                language === 'en'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {content.englishLabel}
            </button>
          </div>

          {userProfile ? (
            <button
              type="button"
              id="top-logout-btn"
              data-testid="top-logout-btn"
              onClick={onLogout}
              title={userProfile.email}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-border)] whitespace-nowrap shrink-0"
            >
              <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span>{content.auth.logoutNavButton}</span>
            </button>
          ) : (
            <button
              type="button"
              id="top-login-btn"
              data-testid="top-login-btn"
              onClick={onOpenAuth}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl bg-[var(--color-primary)] px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-[var(--color-primary-hover)] whitespace-nowrap shrink-0"
            >
              <LogIn aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span>{content.auth.loginNavButton}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
