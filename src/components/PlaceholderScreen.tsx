import { Compass, Layers } from 'lucide-react';
import { ScreenId, TranslationContent } from '../i18n/translations';

interface PlaceholderScreenProps {
  screenId: Exclude<ScreenId, 'welcome'>;
  content: TranslationContent;
  onBackToWelcome: () => void;
}

export function PlaceholderScreen({
  screenId,
  content,
  onBackToWelcome,
}: PlaceholderScreenProps) {
  const screenContent = content.screens[screenId];
  const Icon = screenId === 'skills' ? Layers : Compass;

  return (
    <section
      aria-labelledby="screen-heading"
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-12 text-center sm:px-10 sm:py-16"
    >
      <div
        aria-hidden="true"
        className="mb-8 flex h-18 w-18 items-center justify-center rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-accent)]"
      >
        <Icon className="h-9 w-9 stroke-[1.75]" />
      </div>

      <h1
        id="screen-heading"
        className="mb-6 text-3xl font-bold text-[var(--color-primary)] sm:text-4xl text-balance"
      >
        {screenContent.title}
      </h1>

      <p className="mb-12 max-w-lg text-lg font-medium text-[var(--color-text-muted)] sm:text-xl text-balance">
        {screenContent.description}
      </p>

      <div className="w-full max-w-sm">
        <button
          type="button"
          onClick={onBackToWelcome}
          className="flex min-h-[60px] w-full items-center justify-center rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] px-8 py-4 text-lg font-bold text-[var(--color-primary)] transition-transform duration-150 hover:bg-[var(--color-border)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] whitespace-nowrap"
        >
          {screenContent.backButton}
        </button>
      </div>
    </section>
  );
}
