import { useState } from 'react';
import { Calculator, Check, ChevronUp } from 'lucide-react';
import { TranslationContent } from '../i18n/translations';
import {
  calculateProductPrice,
  formatPkr,
  INITIAL_PRICE_INPUTS,
  PriceBreakdown,
  PriceCalculatorInputs,
  PriceFieldKey,
  PriceValidationErrorType,
  validatePriceInputs,
} from '../utils/priceCalculator';

interface ProductPriceCalculatorProps {
  productIndex: number;
  content: TranslationContent;
  savedBreakdown: PriceBreakdown | null;
  onSavePrice: (breakdown: PriceBreakdown, inputs: PriceCalculatorInputs) => void;
  initialInputs?: PriceCalculatorInputs;
}

export function ProductPriceCalculator({
  productIndex,
  content,
  savedBreakdown,
  onSavePrice,
  initialInputs = INITIAL_PRICE_INPUTS,
}: ProductPriceCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputs, setInputs] = useState<PriceCalculatorInputs>(initialInputs);
  const [touched, setTouched] = useState<Partial<Record<PriceFieldKey, boolean>>>({});
  const [attemptedSave, setAttemptedSave] = useState(false);

  const calcLabels = content.nextStep.priceCalculator;
  const validation = validatePriceInputs(inputs);
  const liveBreakdown = calculateProductPrice(inputs);

  const handleFieldChange = (field: PriceFieldKey, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const getErrorText = (errType?: PriceValidationErrorType): string | null => {
    if (!errType) return null;
    if (errType === 'empty') return calcLabels.validationEmpty;
    if (errType === 'negative') return calcLabels.validationNegative;
    return calcLabels.validationInvalid;
  };

  const shouldShowError = (field: PriceFieldKey): boolean => {
    return Boolean((touched[field] || attemptedSave) && validation.errors[field]);
  };

  const handleSave = () => {
    setAttemptedSave(true);
    if (!liveBreakdown) {
      return;
    }
    onSavePrice(liveBreakdown, inputs);
    setIsOpen(false);
  };

  const fields: Array<{
    key: PriceFieldKey;
    label: string;
    placeholder: string;
  }> = [
    {
      key: 'materials',
      label: calcLabels.materialCostLabel,
      placeholder: calcLabels.materialCostPlaceholder,
    },
    {
      key: 'hours',
      label: calcLabels.hoursLabel,
      placeholder: calcLabels.hoursPlaceholder,
    },
    {
      key: 'hourlyRate',
      label: calcLabels.hourlyRateLabel,
      placeholder: calcLabels.hourlyRatePlaceholder,
    },
    {
      key: 'otherCosts',
      label: calcLabels.otherCostsLabel,
      placeholder: calcLabels.otherCostsPlaceholder,
    },
    {
      key: 'marginPercent',
      label: calcLabels.marginPercentLabel,
      placeholder: calcLabels.marginPercentPlaceholder,
    },
  ];

  return (
    <div className="border-t border-[var(--color-border)] pt-4">
      {/* Saved Price Display on Product Card */}
      {savedBreakdown && (
        <div
          data-testid={`saved-price-display-${productIndex}`}
          className="mb-4 flex flex-col gap-1.5 pb-3 border-b border-[var(--color-border)]"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-base font-bold text-[var(--color-text-muted)]">
              {calcLabels.savedPriceHeading}
            </span>
            <span
              data-testid={`saved-price-value-${productIndex}`}
              className="font-english text-2xl font-bold text-[var(--color-primary)] tabular-nums"
              dir="ltr"
            >
              {formatPkr(savedBreakdown.finalPrice)}
            </span>
          </div>
          <span className="text-sm font-medium text-[var(--color-text-muted)]">
            {content.lang === 'ur'
              ? calcLabels.ownCostsLabelUrdu
              : calcLabels.ownCostsLabelEnglish}
          </span>
        </div>
      )}

      {/* Toggle Button */}
      <button
        type="button"
        id={`calculate-price-btn-${productIndex}`}
        data-testid={`calculate-price-btn-${productIndex}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-3 text-lg font-bold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] whitespace-nowrap ${
          isOpen
            ? 'border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-primary)]'
            : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:scale-[0.98]'
        }`}
      >
        {isOpen ? (
          <>
            <ChevronUp aria-hidden="true" className="h-5 w-5 shrink-0" />
            <span>{calcLabels.closeCalculatorButton}</span>
          </>
        ) : (
          <>
            <Calculator aria-hidden="true" className="h-5 w-5 shrink-0" />
            <span>
              {savedBreakdown
                ? calcLabels.editPriceButton
                : calcLabels.calculatePriceButton}
            </span>
          </>
        )}
      </button>

      {/* Expandable Price Calculator Panel */}
      {isOpen && (
        <div
          data-testid={`price-calculator-panel-${productIndex}`}
          className="mt-5 flex flex-col gap-5 border-t border-[var(--color-border)] pt-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map(({ key, label, placeholder }) => {
              const inputId = `price-${key}-${productIndex}`;
              const hasErr = shouldShowError(key);
              const errMsg = hasErr
                ? getErrorText(validation.errors[key])
                : null;

              return (
                <div key={key} className="flex flex-col gap-1.5">
                  <label
                    htmlFor={inputId}
                    className="text-base font-bold text-[var(--color-text)]"
                  >
                    {label}
                  </label>
                  <input
                    id={inputId}
                    data-testid={inputId}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    dir="ltr"
                    value={inputs[key]}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, [key]: true }))
                    }
                    placeholder={placeholder}
                    aria-invalid={hasErr}
                    className={`font-english min-h-[52px] w-full rounded-xl border bg-[var(--color-canvas)] px-4 py-2.5 text-lg font-semibold text-[var(--color-text)] tabular-nums placeholder:text-[var(--color-text-muted)]/60 focus:outline-2 ${
                      hasErr
                        ? 'border-[var(--color-primary)] focus:outline-[var(--color-primary)]'
                        : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-[var(--color-primary)]'
                    }`}
                  />
                  {errMsg && (
                    <span
                      role="alert"
                      data-testid={`error-${key}-${productIndex}`}
                      className="text-sm font-semibold text-[var(--color-primary)]"
                    >
                      {errMsg}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Line-by-Line Breakdown & Final Price */}
          {liveBreakdown ? (
            <div
              data-testid={`price-breakdown-${productIndex}`}
              className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4"
            >
              <h4 className="text-lg font-bold text-[var(--color-primary)]">
                {calcLabels.breakdownHeading}
              </h4>

              <dl className="flex flex-col gap-2 text-base">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[var(--color-text-muted)]">
                    {calcLabels.breakdownMaterials}
                  </dt>
                  <dd
                    dir="ltr"
                    className="font-english font-semibold text-[var(--color-text)] tabular-nums"
                  >
                    {formatPkr(liveBreakdown.materialCost)}
                  </dd>
                </div>

                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[var(--color-text-muted)]">
                    {calcLabels.breakdownLabor(
                      liveBreakdown.hours,
                      liveBreakdown.hourlyRate
                    )}
                  </dt>
                  <dd
                    dir="ltr"
                    className="font-english font-semibold text-[var(--color-text)] tabular-nums"
                  >
                    {formatPkr(liveBreakdown.laborCost)}
                  </dd>
                </div>

                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[var(--color-text-muted)]">
                    {calcLabels.breakdownOther}
                  </dt>
                  <dd
                    dir="ltr"
                    className="font-english font-semibold text-[var(--color-text)] tabular-nums"
                  >
                    {formatPkr(liveBreakdown.otherCosts)}
                  </dd>
                </div>

                <div className="flex items-baseline justify-between gap-4 border-t border-[var(--color-border)] pt-2">
                  <dt className="font-bold text-[var(--color-text)]">
                    {calcLabels.breakdownBaseCost}
                  </dt>
                  <dd
                    dir="ltr"
                    className="font-english font-bold text-[var(--color-text)] tabular-nums"
                  >
                    {formatPkr(liveBreakdown.baseCost)}
                  </dd>
                </div>

                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[var(--color-text-muted)]">
                    {calcLabels.breakdownProfit(liveBreakdown.marginPercent)}
                  </dt>
                  <dd
                    dir="ltr"
                    className="font-english font-semibold text-[var(--color-text)] tabular-nums"
                  >
                    + {formatPkr(liveBreakdown.profitAmount)}
                  </dd>
                </div>

                <div className="flex items-baseline justify-between gap-4 border-t border-[var(--color-border)] pt-3">
                  <dt className="text-xl font-bold text-[var(--color-primary)]">
                    {calcLabels.finalPriceLabel}
                  </dt>
                  <dd
                    dir="ltr"
                    data-testid={`calculated-final-price-${productIndex}`}
                    className="font-english text-2xl font-bold text-[var(--color-primary)] tabular-nums"
                  >
                    {formatPkr(liveBreakdown.finalPrice)}
                  </dd>
                </div>
              </dl>

              {/* Required label: "Calculated from your own costs" */}
              <div
                data-testid={`own-costs-label-${productIndex}`}
                className="pt-1"
              >
                <span className="text-sm font-medium text-[var(--color-text-muted)]">
                  {content.lang === 'ur'
                    ? calcLabels.ownCostsLabelUrdu
                    : calcLabels.ownCostsLabelEnglish}
                </span>
              </div>
            </div>
          ) : (
            <p
              data-testid={`price-validation-hint-${productIndex}`}
              className="text-sm font-medium text-[var(--color-text-muted)]"
            >
              {calcLabels.validationSummary}
            </p>
          )}

          {/* Save Price Button */}
          <button
            type="button"
            id={`save-price-btn-${productIndex}`}
            data-testid={`save-price-btn-${productIndex}`}
            onClick={handleSave}
            className={`flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl px-6 py-3 text-lg font-bold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] whitespace-nowrap ${
              liveBreakdown
                ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:scale-[0.98] cursor-pointer'
                : 'bg-[var(--color-border)] text-[var(--color-text-muted)] cursor-pointer'
            }`}
          >
            <Check aria-hidden="true" className="h-5 w-5 shrink-0 stroke-[2.5]" />
            <span>{calcLabels.savePriceButton}</span>
          </button>
        </div>
      )}
    </div>
  );
}
