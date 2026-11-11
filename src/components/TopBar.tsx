import { Language, TranslationContent } from '../i18n/translations';

interface TopBarProps {
  language: Language;
  content: TranslationContent;
  onLanguageChange: (lang: Language) => void;
  onBrandClick: () => void;
}

export function TopBar({
  language,
  content,
  onLanguageChange,
  onBrandClick,
}: TopBarProps) {
  return (
    <header className="w-full border-b border-[var(--color-border)] bg-[var(--color-canvas)]">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <button
          type="button"
          onClick={onBrandClick}
          className="text-xl font-bold tracking-tight text-[var(--color-primary)] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] rounded-lg py-1"
        >
          {content.appName}
        </button>

        <div
          role="group"
          aria-label={content.languageLabel}
          className="inline-flex items-center rounded-2xl bg-[var(--color-surface)] p-1 border border-[var(--color-border)] shrink-0"
        >
          <button
            type="button"
            onClick={() => onLanguageChange('ur')}
            aria-pressed={language === 'ur'}
            lang="ur"
            dir="rtl"
            className={`font-urdu min-h-[44px] min-w-[76px] px-4 py-1.5 text-base font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
              language === 'ur'
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {content.urduLabel}
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            aria-pressed={language === 'en'}
            lang="en"
            dir="ltr"
            className={`font-english min-h-[44px] min-w-[84px] px-4 py-1.5 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
              language === 'en'
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {content.englishLabel}
          </button>
        </div>
      </div>
    </header>
  );
}
