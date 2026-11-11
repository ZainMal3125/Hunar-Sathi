import {
  ArrowLeft,
  ArrowRight,
  Compass,
  HelpCircle,
  ListChecks,
  PlusCircle,
  ShieldAlert,
  Store,
} from 'lucide-react';
import { TranslationContent } from '../i18n/translations';

interface AboutLimitationsScreenProps {
  content: TranslationContent;
  onBackToWelcome: () => void;
  onStartCreating: () => void;
  onOpenDirectory: () => void;
}

export function AboutLimitationsScreen({
  content,
  onBackToWelcome,
  onStartCreating,
  onOpenDirectory,
}: AboutLimitationsScreenProps) {
  const labels = content.aboutLimitations;
  const isRtl = content.dir === 'rtl';

  return (
    <section
      aria-labelledby="about-limitations-heading"
      data-testid="about-limitations-page"
      className="mx-auto flex w-full max-w-[500px] flex-1 flex-col gap-7 px-5 py-7 sm:px-6 sm:py-9"
    >
      {/* Top Back to Home Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          id="how-it-works-back-home-btn"
          data-testid="how-it-works-back-home-btn"
          onClick={onBackToWelcome}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-sm font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-border)]"
        >
          {isRtl ? (
            <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
          ) : (
            <ArrowLeft aria-hidden="true" className="h-4 w-4 shrink-0" />
          )}
          <span>{labels.backButton}</span>
        </button>
      </div>

      {/* Page Header */}
      <div className="flex flex-col items-center text-center">
        <div
          aria-hidden="true"
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-accent)]"
        >
          <Compass className="h-8 w-8 stroke-[1.75]" />
        </div>

        <h1
          id="about-limitations-heading"
          className="mb-2.5 text-3xl font-bold tracking-tight text-[var(--color-primary)] text-balance"
        >
          {labels.pageHeading}
        </h1>

        <p className="text-lg font-medium text-[var(--color-text-muted)] text-balance">
          {labels.pageSubtitle}
        </p>
      </div>

      {/* Section 1: 4-Step Explanation */}
      <div
        data-testid="how-it-works-steps"
        className="flex flex-col gap-3.5"
      >
        <div className="flex items-center gap-2.5 border-b border-[var(--color-border)] pb-2.5">
          <ListChecks
            aria-hidden="true"
            className="h-6 w-6 shrink-0 text-[var(--color-accent)]"
          />
          <h2 className="text-2xl font-bold text-[var(--color-primary)]">
            {labels.stepsHeading}
          </h2>
        </div>

        {labels.steps.map((step, idx) => (
          <article
            key={step.title}
            data-testid={`how-step-${idx}`}
            className="flex flex-col gap-2 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          >
            <h3 className="text-lg font-bold text-[var(--color-primary)]">
              {step.title}
            </h3>
            <p className="text-base font-medium text-[var(--color-text)]">
              {step.description}
            </p>
          </article>
        ))}
      </div>

      {/* Section 2: Short FAQ */}
      <div
        data-testid="how-it-works-faq"
        className="flex flex-col gap-3.5"
      >
        <div className="flex items-center gap-2.5 border-b border-[var(--color-border)] pb-2.5">
          <HelpCircle
            aria-hidden="true"
            className="h-6 w-6 shrink-0 text-[var(--color-accent)]"
          />
          <h2 className="text-2xl font-bold text-[var(--color-primary)]">
            {labels.faqHeading}
          </h2>
        </div>

        {labels.faqs.map((faq, idx) => (
          <article
            key={faq.question}
            data-testid={`how-faq-${idx}`}
            className="flex flex-col gap-2 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          >
            <h3 className="text-lg font-bold text-[var(--color-primary)]">
              {faq.question}
            </h3>
            <p className="text-base font-medium text-[var(--color-text)]">
              {faq.answer}
            </p>
          </article>
        ))}
      </div>

      {/* Section 3: AI & Limitations */}
      <div
        data-testid="about-limitations-list"
        className="flex flex-col gap-3.5"
      >
        <div className="flex items-center gap-2.5 border-b border-[var(--color-border)] pb-2.5">
          <ShieldAlert
            aria-hidden="true"
            className="h-6 w-6 shrink-0 text-[var(--color-accent)]"
          />
          <h2 className="text-2xl font-bold text-[var(--color-primary)]">
            {labels.heading}
          </h2>
        </div>

        <p className="text-base font-medium text-[var(--color-text-muted)]">
          {labels.subtitle}
        </p>

        {labels.items.map((item, idx) => (
          <article
            key={item.title}
            data-testid={`about-item-${idx}`}
            className="flex flex-col gap-2 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          >
            <h3
              data-testid={`about-item-title-${idx}`}
              className="text-lg font-bold text-[var(--color-primary)] border-b border-[var(--color-border)] pb-2"
            >
              {item.title}
            </h3>
            <p
              data-testid={`about-item-desc-${idx}`}
              className="text-base font-medium text-[var(--color-text)]"
            >
              {item.description}
            </p>
          </article>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-1">
        <button
          type="button"
          id="how-it-works-start-btn"
          data-testid="how-it-works-start-btn"
          onClick={onStartCreating}
          className="flex min-h-[58px] w-full items-center justify-center gap-3 rounded-2xl bg-[var(--color-primary)] px-6 py-3.5 text-center text-lg font-bold text-white shadow-xs transition-transform duration-150 hover:bg-[var(--color-primary-hover)] active:scale-[0.98]"
        >
          <PlusCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
          <span>{labels.startCreatingButton}</span>
        </button>

        <button
          type="button"
          id="about-open-directory-btn"
          data-testid="about-open-directory-btn"
          onClick={onOpenDirectory}
          className="flex min-h-[56px] w-full items-center justify-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3.5 text-center text-lg font-bold text-[var(--color-primary)] transition-colors duration-150 hover:bg-[var(--color-border)] active:scale-[0.98]"
        >
          <Store aria-hidden="true" className="h-5 w-5 shrink-0" />
          <span>{labels.browseDirectoryButton}</span>
        </button>

        <button
          type="button"
          id="about-back-welcome-btn"
          data-testid="about-back-welcome-btn"
          onClick={onBackToWelcome}
          className="flex min-h-[54px] w-full items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 text-center text-base font-bold text-[var(--color-text-muted)] transition-colors duration-150 hover:bg-[var(--color-border)] hover:text-[var(--color-primary)] active:scale-[0.98]"
        >
          <span>{labels.backButton}</span>
        </button>
      </div>
    </section>
  );
}

