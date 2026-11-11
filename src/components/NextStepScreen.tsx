import { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Home,
  Loader2,
  MessageCircle,
  RefreshCw,
  RotateCcw,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { TranslationContent } from '../i18n/translations';
import {
  BusinessGuideResponse,
  getLocalizedProductDescription,
} from '../utils/businessGuide';
import {
  INITIAL_PRICE_INPUTS,
  PriceBreakdown,
  PriceCalculatorInputs,
} from '../utils/priceCalculator';
import { ShopProductItem, ShopRecord } from '../utils/shopManager';
import {
  getResolvedSkillDisplay,
  SkillFormState,
} from '../utils/skillForm';
import { FirstWeekPlanSection } from './FirstWeekPlanSection';
import { ProductPriceCalculator } from './ProductPriceCalculator';
import { SaveShopSection } from './SaveShopSection';

interface NextStepScreenProps {
  content: TranslationContent;
  formState: SkillFormState;
  isLoading: boolean;
  error: string | null;
  result: BusinessGuideResponse | null;
  savedShop: ShopRecord | null;
  onShopSaved: (shop: ShopRecord | null) => void;
  onOpenPublicShop: (shopId: string) => void;
  onRetry: () => void;
  onStartOver: () => void;
  onBackToStep1: () => void;
  onBackToHome: () => void;
}

interface SavedProductPriceState {
  breakdown: PriceBreakdown;
  inputs: PriceCalculatorInputs;
}

export function NextStepScreen({
  content,
  formState,
  isLoading,
  error,
  result,
  savedShop,
  onShopSaved,
  onOpenPublicShop,
  onRetry,
  onStartOver,
  onBackToStep1,
  onBackToHome,
}: NextStepScreenProps) {
  const [copied, setCopied] = useState(false);
  const [savedPrices, setSavedPrices] = useState<
    Record<number, SavedProductPriceState>
  >({});
  const labels = content.nextStep;
  const flowLabels = content.createFlow;
  const isRtl = content.dir === 'rtl';

  const hasSavedAnyPrice = Object.keys(savedPrices).length > 0;
  const currentStepNumber = savedShop || hasSavedAnyPrice ? 3 : 2;

  const resolvedSkill = getResolvedSkillDisplay(formState, content);
  const allPhotoUrls = formState.photos.map((p) => p.dataUrl);
  const primaryPhotoUrls = allPhotoUrls.slice(0, 1);

  const shopProducts: ShopProductItem[] = result
    ? result.suggested_products.map((prod, idx) => ({
        name: prod.name,
        description: getLocalizedProductDescription(prod, content.lang),
        reason: prod.reason,
        price: savedPrices[idx]?.breakdown.finalPrice ?? null,
        photos: primaryPhotoUrls,
      }))
    : [];

  const handleSaveProductPrice = (
    productIndex: number,
    breakdown: PriceBreakdown,
    inputs: PriceCalculatorInputs
  ) => {
    setSavedPrices((prev) => ({
      ...prev,
      [productIndex]: { breakdown, inputs },
    }));
  };

  const handleCopyWhatsApp = async (textToCopy: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  return (
    <section
      aria-labelledby="next-step-heading"
      data-testid="create-results-screen"
      className="mx-auto flex w-full max-w-[500px] flex-1 flex-col justify-center px-5 py-7 sm:px-6 sm:py-9"
    >
      {/* Top Back / Home Navigation & Step Progress Indicator */}
      <div className="mb-6 flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="results-back-step1-btn"
              data-testid="results-back-step1-btn"
              onClick={onBackToStep1}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-border)]"
            >
              {isRtl ? (
                <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
              ) : (
                <ArrowLeft aria-hidden="true" className="h-4 w-4 shrink-0" />
              )}
              <span>{flowLabels.backToStep1Button}</span>
            </button>

            <button
              type="button"
              id="results-back-home-btn"
              data-testid="results-back-home-btn"
              onClick={onBackToHome}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-bold text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-border)] hover:text-[var(--color-primary)]"
            >
              <Home aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span>{content.nav.welcome}</span>
            </button>
          </div>

          <span
            data-testid="create-progress-indicator"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-1.5 text-sm font-bold text-[var(--color-accent)] tabular-nums"
          >
            {flowLabels.stepIndicator(currentStepNumber, 3)}
          </span>
        </div>

        {/* 3-Step Visual Progress Bar & Labels */}
        <div
          aria-label={flowLabels.stepIndicator(currentStepNumber, 3)}
          className="grid grid-cols-3 gap-2"
        >
          {flowLabels.steps.map((stepTitle, idx) => {
            const stepNum = idx + 1;
            const isCompletedOrCurrent = stepNum <= currentStepNumber;
            const isCurrent = stepNum === currentStepNumber;
            return (
              <div key={stepTitle} className="flex flex-col gap-1.5">
                <div
                  className={`h-2 w-full rounded-full transition-colors ${
                    isCompletedOrCurrent
                      ? 'bg-[var(--color-primary)]'
                      : 'bg-[var(--color-border)]'
                  }`}
                />
                <span
                  className={`text-xs leading-snug ${
                    isCurrent
                      ? 'font-bold text-[var(--color-primary)]'
                      : isCompletedOrCurrent
                      ? 'font-semibold text-[var(--color-accent)]'
                      : 'font-medium text-[var(--color-text-muted)]'
                  }`}
                >
                  {stepNum}. {stepTitle}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          data-testid="analysis-loading-state"
          className="mb-8 flex flex-col items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 text-center sm:px-10"
        >
          <div
            aria-hidden="true"
            className="mb-6 flex h-18 w-18 items-center justify-center rounded-3xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-accent)]"
          >
            <Loader2 className="h-9 w-9 animate-spin stroke-[2]" />
          </div>
          <h1
            id="next-step-heading"
            className="mb-3 text-2xl font-bold text-[var(--color-primary)] sm:text-3xl text-balance"
          >
            {labels.loadingTitle}
          </h1>
          <p className="max-w-lg text-lg font-medium text-[var(--color-text-muted)] text-balance">
            {labels.loadingSubtitle}
          </p>
        </div>
      )}

      {/* Friendly Retry / Error State */}
      {!isLoading && error && (
        <div
          role="alert"
          data-testid="analysis-error-state"
          className="mb-8 flex flex-col items-center justify-center rounded-3xl border border-[var(--color-primary)]/30 bg-[var(--color-surface)] px-6 py-10 text-center sm:px-10"
        >
          <div
            aria-hidden="true"
            className="mb-6 flex h-18 w-18 items-center justify-center rounded-3xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-primary)]"
          >
            <AlertCircle className="h-9 w-9 stroke-[2]" />
          </div>
          <h1
            id="next-step-heading"
            className="mb-3 text-2xl font-bold text-[var(--color-primary)] sm:text-3xl text-balance"
          >
            {labels.errorTitle}
          </h1>
          <p className="mb-8 max-w-lg text-lg font-medium text-[var(--color-text-muted)] text-balance">
            {labels.errorSubtitle}
          </p>
          <div className="flex w-full max-w-sm flex-col gap-3.5">
            <button
              type="button"
              id="retry-analysis-btn"
              onClick={onRetry}
              className="flex min-h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-[var(--color-primary)] px-8 py-4 text-xl font-bold text-white shadow-xs transition-transform duration-150 hover:bg-[var(--color-primary-hover)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] whitespace-nowrap"
            >
              <RefreshCw aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span>{labels.retryButton}</span>
            </button>

            <button
              type="button"
              id="error-start-over-btn"
              onClick={onStartOver}
              className="flex min-h-[56px] w-full items-center justify-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-6 py-3.5 text-lg font-bold text-[var(--color-primary)] transition-transform duration-150 hover:bg-[var(--color-border)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] whitespace-nowrap"
            >
              <RotateCcw aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span>{labels.startOverButton}</span>
            </button>
          </div>
        </div>
      )}

      {/* Polished Results Screen */}
      {!isLoading && !error && result && (
        <div
          data-testid="polished-results-screen"
          className="flex flex-col gap-7"
        >
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div
              aria-hidden="true"
              className="mb-5 flex h-18 w-18 items-center justify-center rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-accent)]"
            >
              <CheckCircle2 className="h-9 w-9 stroke-[2]" />
            </div>

            <h1
              id="next-step-heading"
              className="mb-3 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl text-balance"
            >
              {labels.heading}
            </h1>
            <p className="max-w-lg text-lg font-medium text-[var(--color-text-muted)] text-balance">
              {labels.subtitle}
            </p>
          </div>

          {/* 1. Card for Skill Summary and Style Description */}
          <article
            data-testid="card-skill-and-style"
            className="flex flex-col gap-5 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
          >
            <h2 className="text-2xl font-bold text-[var(--color-primary)] border-b border-[var(--color-border)] pb-3">
              {labels.skillAndStyleCardTitle}
            </h2>

            <div className="flex flex-col gap-2">
              <h3 className="text-base font-bold text-[var(--color-text-muted)]">
                {labels.skillSummaryLabel}
              </h3>
              <p
                data-testid="result-skill-summary"
                className="text-lg font-medium text-[var(--color-text)] whitespace-pre-line"
              >
                {result.skill_summary}
              </p>
            </div>

            <div className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-4">
              <h3 className="text-base font-bold text-[var(--color-text-muted)]">
                {labels.styleDescriptionLabel}
              </h3>
              <p
                data-testid="result-style-description"
                className="text-lg font-medium text-[var(--color-text)] whitespace-pre-line"
              >
                {result.style_description}
              </p>
            </div>
          </article>

          {/* 2. Card for Target Customers */}
          <article
            data-testid="card-target-customers"
            className="flex flex-col gap-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-3">
              <Users
                aria-hidden="true"
                className="h-6 w-6 shrink-0 text-[var(--color-accent)] stroke-[2]"
              />
              <h2 className="text-2xl font-bold text-[var(--color-primary)]">
                {labels.targetCustomersCardTitle}
              </h2>
            </div>

            <p
              data-testid="result-target-customers"
              className="text-lg font-medium text-[var(--color-text)] whitespace-pre-line"
            >
              {result.target_customers}
            </p>
          </article>

          {/* 3. Three Product Cards with embedded Price Calculator */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 px-1">
              <ShoppingBag
                aria-hidden="true"
                className="h-6 w-6 shrink-0 text-[var(--color-accent)] stroke-[2]"
              />
              <h2 className="text-2xl font-bold text-[var(--color-primary)]">
                {labels.suggestedProductsHeading}
              </h2>
            </div>

            <div
              data-testid="result-suggested-products"
              className="flex flex-col gap-5"
            >
              {result.suggested_products.map((product, index) => {
                const localizedDescription = getLocalizedProductDescription(
                  product,
                  content.lang
                );
                const savedEntry = savedPrices[index];
                return (
                  <article
                    key={`${product.name}-${index}`}
                    data-testid={`product-card-${index}`}
                    className="flex flex-col gap-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-7"
                  >
                    <h3
                      data-testid={`product-name-${index}`}
                      className="text-xl font-bold text-[var(--color-primary)] sm:text-2xl border-b border-[var(--color-border)] pb-3"
                    >
                      {product.name}
                    </h3>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-base font-bold text-[var(--color-text-muted)]">
                        {labels.productReasonLabel}
                      </span>
                      <p
                        data-testid={`product-reason-${index}`}
                        className="text-lg text-[var(--color-text)]"
                      >
                        {product.reason}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 border-t border-[var(--color-border)] pt-3.5">
                      <span className="text-base font-bold text-[var(--color-text-muted)]">
                        {labels.productDescriptionLabel}
                      </span>
                      <p
                        data-testid={`product-description-${index}`}
                        className="text-lg font-medium text-[var(--color-text)]"
                      >
                        {localizedDescription}
                      </p>
                    </div>

                    {/* Product Price Calculator */}
                    <ProductPriceCalculator
                      productIndex={index}
                      content={content}
                      savedBreakdown={savedEntry?.breakdown ?? null}
                      initialInputs={savedEntry?.inputs ?? INITIAL_PRICE_INPUTS}
                      onSavePrice={(breakdown, inputs) =>
                        handleSaveProductPrice(index, breakdown, inputs)
                      }
                    />
                  </article>
                );
              })}
            </div>
          </div>

          {/* 4. Card for WhatsApp Message with Copy button showing Copied feedback */}
          <article
            data-testid="card-whatsapp-message"
            className="flex flex-col gap-5 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-3">
              <MessageCircle
                aria-hidden="true"
                className="h-6 w-6 shrink-0 text-[var(--color-accent)] stroke-[2]"
              />
              <h2 className="text-2xl font-bold text-[var(--color-primary)]">
                {labels.whatsappCardTitle}
              </h2>
            </div>

            <p className="text-base font-medium text-[var(--color-text-muted)]">
              {labels.whatsappHelper}
            </p>

            <p
              lang="ur"
              dir="rtl"
              data-testid="result-whatsapp-message"
              className="font-urdu text-xl font-medium text-[var(--color-text)] whitespace-pre-line"
            >
              {result.whatsapp_message_urdu}
            </p>

            <div>
              <button
                type="button"
                id="copy-whatsapp-btn"
                onClick={() => handleCopyWhatsApp(result.whatsapp_message_urdu)}
                aria-live="polite"
                className={`flex min-h-[56px] w-full sm:w-auto sm:min-w-[200px] items-center justify-center gap-3 rounded-2xl px-7 py-3.5 text-lg font-bold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] whitespace-nowrap ${
                  copied
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:scale-[0.98]'
                }`}
              >
                {copied ? (
                  <Check aria-hidden="true" className="h-5 w-5 shrink-0 stroke-[2.5]" />
                ) : (
                  <Copy aria-hidden="true" className="h-5 w-5 shrink-0 stroke-[2]" />
                )}
                <span data-testid="copy-whatsapp-status">
                  {copied ? labels.copiedButton : labels.copyButton}
                </span>
              </button>
            </div>
          </article>

          {/* 5. First Week Plan (7-Day Interactive Checklist) */}
          <FirstWeekPlanSection
            content={content}
            skill={resolvedSkill}
            city={formState.city.trim()}
            productNames={result.suggested_products.map((p) => p.name)}
          />

          {/* 6. Save Shop to Firestore Section */}
          <SaveShopSection
            content={content}
            skill={resolvedSkill}
            city={formState.city.trim()}
            products={shopProducts}
            photos={allPhotoUrls}
            savedShop={savedShop}
            onShopSaved={onShopSaved}
            onOpenPublicShop={onOpenPublicShop}
          />

          {/* 7. Visible Advisory Note at the Bottom */}
          <div
            data-testid="advisory-disclaimer-note"
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/70 px-5 py-4 text-center"
          >
            <p className="text-base font-medium text-[var(--color-text-muted)]">
              {content.lang === 'ur'
                ? labels.advisoryNoteUrdu
                : labels.advisoryNoteEnglish}
            </p>
          </div>

          {/* 6. Start Over Button */}
          <div className="pt-1">
            <button
              type="button"
              id="start-over-btn"
              onClick={onStartOver}
              className="flex min-h-[64px] w-full items-center justify-center gap-3 rounded-2xl bg-[var(--color-primary)] px-8 py-4 text-xl font-bold text-white shadow-sm transition-transform duration-150 hover:bg-[var(--color-primary-hover)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] whitespace-nowrap"
            >
              <RotateCcw aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span>{labels.startOverButton}</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
