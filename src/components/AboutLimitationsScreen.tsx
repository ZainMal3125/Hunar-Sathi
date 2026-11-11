import { Compass, Store } from 'lucide-react';
import { TranslationContent } from '../i18n/translations';

interface AboutLimitationsScreenProps {
  content: TranslationContent;
  onBackToWelcome: () => void;
  onOpenDirectory: () => void;
}

export function AboutLimitationsScreen({
  content,
  onBackToWelcome,
  onOpenDirectory,
}: AboutLimitationsScreenProps) {
  const labels = content.aboutLimitations;

  return (
    <section
      aria-labelledby="about-limitations-heading"
      data-testid="about-limitations-page"
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-7 px-5 py-10 sm:px-8 sm:py-14"
    >
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div
          aria-hidden="true"
          className="mb-5 flex h-18 w-18 items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-accent)]"
        >
          <Compass className="h-9 w-9 stroke-[1.75]" />
        </div>

        <h1
          id="about-limitations-heading"
          className="mb-3 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl text-balance"
        >
          {labels.heading}
        </h1>

        <p className="max-w-lg text-lg font-medium text-[var(--color-text-muted)] text-balance">
          {labels.subtitle}
        </p>
      </div>

      {/* Four Disclosure & Limitation Statements */}
      <div
        data-testid="about-limitations-list"
        className="flex flex-col gap-4"
      >
        {labels.items.map((item, idx) => (
          <article
            key={item.title}
            data-testid={`about-item-${idx}`}
            className="flex flex-col gap-2 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-7"
          >
            <h2
              data-testid={`about-item-title-${idx}`}
              className="text-xl font-bold text-[var(--color-primary)] border-b border-[var(--color-border)] pb-2.5"
            >
              {item.title}
            </h2>
            <p
              data-testid={`about-item-desc-${idx}`}
              className="text-lg font-medium text-[var(--color-text)]"
            >
              {item.description}
            </p>
          </article>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3.5 pt-1">
        <button
          type="button"
          id="about-open-directory-btn"
          data-testid="about-open-directory-btn"
          onClick={onOpenDirectory}
          className="flex min-h-[58px] w-full items-center justify-center gap-3 rounded-2xl bg-[var(--color-primary)] px-6 py-3.5 text-center text-lg font-bold text-white shadow-xs transition-transform duration-150 hover:bg-[var(--color-primary-hover)] active:scale-[0.98]"
        >
          <Store aria-hidden="true" className="h-5 w-5 shrink-0" />
          <span>{labels.browseDirectoryButton}</span>
        </button>

        <button
          type="button"
          id="about-back-welcome-btn"
          data-testid="about-back-welcome-btn"
          onClick={onBackToWelcome}
          className="flex min-h-[56px] w-full items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3.5 text-center text-lg font-bold text-[var(--color-primary)] transition-colors duration-150 hover:bg-[var(--color-border)] active:scale-[0.98]"
        >
          <span>{labels.backButton}</span>
        </button>
      </div>
    </section>
  );
}
