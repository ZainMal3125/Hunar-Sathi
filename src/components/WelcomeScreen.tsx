import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TranslationContent } from '../i18n/translations';

interface WelcomeScreenProps {
  content: TranslationContent;
  onStart: () => void;
}

export function WelcomeScreen({ content, onStart }: WelcomeScreenProps) {
  const isRtl = content.dir === 'rtl';

  return (
    <section
      aria-labelledby="welcome-heading"
      data-testid="home-screen"
      className="mx-auto flex w-full max-w-[500px] flex-1 flex-col items-center justify-center px-6 py-12 text-center sm:px-7 sm:py-14"
    >
      {/* Warm handcrafted geometric stitch emblem */}
      <div
        aria-hidden="true"
        className="mb-9 flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-accent)] shadow-xs"
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          className="h-10 w-10"
           stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 4L24.5 15.5L36 20L24.5 24.5L20 36L15.5 24.5L4 20L15.5 15.5L20 4Z" />
          <circle cx="20" cy="20" r="3.5" fill="currentColor" stroke="none" />
        </svg>
      </div>

      {/* App Name */}
      <h1
        id="welcome-heading"
        className="mb-8 text-4xl font-bold tracking-tight text-[var(--color-primary)] sm:text-5xl text-balance"
      >
        {content.appName}
      </h1>

      {/* One-line description */}
      <p className="mb-12 max-w-xl text-xl font-medium text-[var(--color-text-muted)] sm:text-2xl text-balance">
        {content.tagline}
      </p>

      {/* Large rounded Start button */}
      <div className="w-full max-w-sm">
        <button
          type="button"
          id="start-btn"
          onClick={onStart}
          className="group flex min-h-[64px] w-full items-center justify-center gap-4 rounded-2xl bg-[var(--color-primary)] px-8 py-4 text-xl font-bold text-white shadow-sm transition-transform duration-150 hover:bg-[var(--color-primary-hover)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] whitespace-nowrap"
        >
          <span>{content.startButton}</span>
          {isRtl ? (
            <ArrowLeft
              aria-hidden="true"
              className="h-6 w-6 shrink-0 text-[var(--color-accent-soft)] transition-transform duration-150 group-hover:-translate-x-1"
            />
          ) : (
            <ArrowRight
              aria-hidden="true"
              className="h-6 w-6 shrink-0 text-[var(--color-accent-soft)] transition-transform duration-150 group-hover:translate-x-1"
            />
          )}
        </button>
      </div>
    </section>
  );
}
