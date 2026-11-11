import { useEffect, useState } from 'react';
import {
  CalendarCheck,
  Check,
  ChevronUp,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { TranslationContent } from '../i18n/translations';
import {
  FirstWeekPlanResponse,
  loadFirstWeekPlanStorage,
  saveFirstWeekPlanStorage,
  toggleCompletedDay,
  validateFirstWeekPlanObject,
} from '../utils/firstWeekPlan';

interface FirstWeekPlanSectionProps {
  content: TranslationContent;
  skill: string;
  city: string;
  productNames: string[];
}

export function FirstWeekPlanSection({
  content,
  skill,
  city,
  productNames,
}: FirstWeekPlanSectionProps) {
  const [plan, setPlan] = useState<FirstWeekPlanResponse | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labels = content.nextStep.firstWeekPlan;

  // Restore saved 7-day plan and ticked items from localStorage on mount
  useEffect(() => {
    const stored = loadFirstWeekPlanStorage(skill, city);
    if (stored) {
      setPlan(stored.plan);
      setCompletedDays(stored.completedDays);
      setIsExpanded(true);
    }
  }, [skill, city]);

  const fetchFirstWeekPlan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/first-week-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skill,
          city,
          products: productNames,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Request failed (${response.status})`;
        try {
          const errJson = (await response.json()) as { error?: string };
          if (errJson?.error) {
            errorMessage = errJson.error;
          }
        } catch {
          // ignore JSON parse failure
        }
        throw new Error(errorMessage);
      }

      const payload = (await response.json()) as { result?: unknown };
      const validated = validateFirstWeekPlanObject(payload?.result);

      setPlan(validated);
      setCompletedDays([]);
      setIsExpanded(true);
      saveFirstWeekPlanStorage({
        skill,
        city,
        plan: validated,
        completedDays: [],
      });
    } catch {
      setError(labels.errorText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (!plan) {
      void fetchFirstWeekPlan();
    } else {
      setIsExpanded((prev) => !prev);
    }
  };

  const handleToggleDay = (dayNumber: number) => {
    if (!plan) return;
    const nextCompleted = toggleCompletedDay(completedDays, dayNumber);
    setCompletedDays(nextCompleted);
    saveFirstWeekPlanStorage({
      skill,
      city,
      plan,
      completedDays: nextCompleted,
    });
  };

  return (
    <article
      data-testid="card-first-week-plan"
      className="flex flex-col gap-5 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-3">
          <CalendarCheck
            aria-hidden="true"
            className="h-6 w-6 shrink-0 text-[var(--color-accent)] stroke-[2]"
          />
          <h2 className="text-2xl font-bold text-[var(--color-primary)]">
            {labels.cardTitle}
          </h2>
        </div>

        {plan && (
          <span
            data-testid="first-week-progress"
            className="text-base font-bold text-[var(--color-text-muted)] tabular-nums"
          >
            {labels.progressLabel(completedDays.length, 7)}
          </span>
        )}
      </div>

      <p className="text-base font-medium text-[var(--color-text-muted)]">
        {labels.cardSubtitle}
      </p>

      {/* Primary "First week plan" Button */}
      <button
        type="button"
        id="first-week-plan-btn"
        data-testid="first-week-plan-btn"
        disabled={isLoading}
        aria-expanded={Boolean(plan && isExpanded)}
        onClick={handleButtonClick}
        className={`flex min-h-[60px] w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-center text-xl font-bold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
          plan && isExpanded
            ? 'border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-primary)]'
            : 'bg-[var(--color-primary)] text-white shadow-xs hover:bg-[var(--color-primary-hover)] active:scale-[0.98]'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2
              aria-hidden="true"
              className="h-5 w-5 shrink-0 animate-spin"
            />
            <span>{labels.loadingText}</span>
          </>
        ) : plan && isExpanded ? (
          <>
            <ChevronUp aria-hidden="true" className="h-5 w-5 shrink-0" />
            <span>{labels.hidePlanButton}</span>
          </>
        ) : (
          <>
            <CalendarCheck aria-hidden="true" className="h-5 w-5 shrink-0" />
            <span>
              {plan ? labels.showPlanButton : labels.openPlanButton}
            </span>
          </>
        )}
      </button>

      {/* Friendly Error & Retry State */}
      {!isLoading && error && (
        <div
          role="alert"
          data-testid="first-week-plan-error"
          className="flex flex-col items-center gap-3.5 rounded-2xl border border-[var(--color-primary)]/30 bg-[var(--color-canvas)] p-5 text-center"
        >
          <p className="text-base font-bold text-[var(--color-primary)]">
            {error}
          </p>
          <button
            type="button"
            id="retry-first-week-plan-btn"
            data-testid="retry-first-week-plan-btn"
            onClick={() => void fetchFirstWeekPlan()}
            className="flex min-h-[52px] items-center justify-center gap-2.5 rounded-2xl bg-[var(--color-primary)] px-6 py-3 text-lg font-bold text-white transition-transform duration-150 hover:bg-[var(--color-primary-hover)] active:scale-[0.98] whitespace-nowrap"
          >
            <RefreshCw aria-hidden="true" className="h-5 w-5 shrink-0" />
            <span>{labels.retryButton}</span>
          </button>
        </div>
      )}

      {/* 7-Day Interactive Checklist */}
      {plan && isExpanded && (
        <div
          data-testid="first-week-checklist"
          className="flex flex-col gap-3.5 border-t border-[var(--color-border)] pt-4"
        >
          {plan.days.map((item) => {
            const isChecked = completedDays.includes(item.day);
            const checkboxId = `checklist-checkbox-${item.day}`;

            return (
              <label
                key={item.day}
                htmlFor={checkboxId}
                data-testid={`checklist-day-${item.day}`}
                className={`flex min-h-[68px] cursor-pointer items-start gap-4 rounded-2xl border p-4 sm:p-5 transition-colors duration-150 ${
                  isChecked
                    ? 'border-[var(--color-accent)]/50 bg-[var(--color-canvas)]/70'
                    : 'border-[var(--color-border)] bg-[var(--color-canvas)] hover:border-[var(--color-primary)]/40'
                }`}
              >
                <input
                  id={checkboxId}
                  data-testid={checkboxId}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleDay(item.day)}
                  className="sr-only"
                />

                {/* Custom large accessible checkbox indicator */}
                <span
                  aria-hidden="true"
                  className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
                    isChecked
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : 'border-[var(--color-primary)]/50 bg-[var(--color-surface)] text-transparent'
                  }`}
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-baseline gap-2 border-b border-[var(--color-border)] pb-2">
                    <span className="text-base font-bold text-[var(--color-accent)] tabular-nums">
                      {labels.dayLabel(item.day)}:
                    </span>
                    <span
                      className={`text-lg font-bold text-[var(--color-primary)] ${
                        isChecked ? 'line-through opacity-75' : ''
                      }`}
                    >
                      {content.lang === 'ur'
                        ? item.title_urdu
                        : item.title_english}
                    </span>
                  </div>

                  {/* Localized action text matching active language toggle */}
                  <p
                    data-testid={`checklist-action-${item.day}`}
                    className={`text-lg font-medium text-[var(--color-text)] ${
                      isChecked ? 'line-through opacity-75' : ''
                    }`}
                  >
                    {content.lang === 'ur'
                      ? item.action_urdu
                      : item.action_english}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </article>
  );
}
