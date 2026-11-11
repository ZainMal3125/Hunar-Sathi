import { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Store,
  Trash2,
} from 'lucide-react';
import {
  deleteShopFromFirestore,
  saveShopToFirestore,
  updateShopVisibilityInFirestore,
} from '../firebase';
import { TranslationContent } from '../i18n/translations';
import {
  ShopProductItem,
  ShopRecord,
  validateSaveShopInput,
} from '../utils/shopManager';

interface SaveShopSectionProps {
  content: TranslationContent;
  skill: string;
  city: string;
  products: ShopProductItem[];
  photos: string[];
  savedShop: ShopRecord | null;
  onShopSaved: (shop: ShopRecord | null) => void;
  onOpenPublicShop: (shopId: string) => void;
}

export function SaveShopSection({
  content,
  skill,
  city,
  products,
  photos,
  savedShop,
  onShopSaved,
  onOpenPublicShop,
}: SaveShopSectionProps) {
  const [shopName, setShopName] = useState(savedShop?.shopName ?? '');
  const [agreeToShareContact, setAgreeToShareContact] = useState(
    savedShop?.agreeToShareContact ?? false
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    savedShop?.whatsappNumber ?? ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const labels = content.nextStep.saveShop;

  const handleSaveShop = async () => {
    setValidationError(null);
    setStatusMessage(null);

    const validation = validateSaveShopInput({
      shopName,
      skill,
      city,
      agreeToShareContact,
      whatsappNumber,
      products,
      photos,
    });

    if (!validation.isValid) {
      if (validation.errorKey === 'shopNameEmpty') {
        setValidationError(labels.errorShopNameEmpty);
      } else {
        setValidationError(labels.errorInvalidWhatsapp);
      }
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveShopToFirestore(
        {
          shopName,
          skill,
          city,
          agreeToShareContact,
          whatsappNumber: agreeToShareContact ? whatsappNumber : '',
          products,
          photos,
        },
        savedShop?.id
      );
      onShopSaved(saved);
    } catch {
      setValidationError(labels.errorSaveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleHide = async () => {
    if (!savedShop) return;
    setIsUpdatingStatus(true);
    setValidationError(null);
    try {
      const nextHidden = !savedShop.isHidden;
      await updateShopVisibilityInFirestore(savedShop.id, nextHidden);
      onShopSaved({
        ...savedShop,
        isHidden: nextHidden,
      });
    } catch {
      setValidationError(labels.errorSaveFailed);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteShop = async () => {
    if (!savedShop) return;
    setIsUpdatingStatus(true);
    setValidationError(null);
    try {
      await deleteShopFromFirestore(savedShop.id);
      onShopSaved(null);
      setStatusMessage(labels.shopDeletedMessage);
    } catch {
      setValidationError(labels.errorSaveFailed);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCopyLink = async () => {
    if (!savedShop) return;
    const shareUrl = `${window.location.origin}/shop/${savedShop.id}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch {
      // Fallback
    }
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <article
      data-testid="card-save-shop"
      className="flex flex-col gap-5 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
    >
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-3">
        <Store
          aria-hidden="true"
          className="h-6 w-6 shrink-0 text-[var(--color-accent)] stroke-[2]"
        />
        <h2 className="text-2xl font-bold text-[var(--color-primary)]">
          {labels.cardTitle}
        </h2>
      </div>

      <p className="text-base font-medium text-[var(--color-text-muted)]">
        {labels.cardSubtitle}
      </p>

      {/* Shop Name Input */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="shop-name-input"
          className="text-lg font-bold text-[var(--color-text)]"
        >
          {labels.shopNameLabel}
        </label>
        <input
          id="shop-name-input"
          data-testid="shop-name-input"
          type="text"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          placeholder={labels.shopNamePlaceholder}
          className="min-h-[56px] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-3 text-lg text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/60 focus:border-[var(--color-primary)] focus:outline-2 focus:outline-[var(--color-primary)]"
        />
      </div>

      {/* Checkbox: "I agree to share my contact details" */}
      <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4">
        <label
          htmlFor="agree-contact-checkbox"
          className="flex min-h-[48px] cursor-pointer items-start gap-3.5 py-1"
        >
          <input
            id="agree-contact-checkbox"
            data-testid="agree-contact-checkbox"
            type="checkbox"
            checked={agreeToShareContact}
            onChange={(e) => {
              const checked = e.target.checked;
              setAgreeToShareContact(checked);
              if (!checked) {
                setWhatsappNumber('');
              }
            }}
            className="mt-1.5 h-6 w-6 shrink-0 rounded-md accent-[var(--color-primary)] cursor-pointer"
          />
          <span className="text-lg font-bold text-[var(--color-text)]">
            {content.lang === 'ur'
              ? labels.agreeCheckboxLabelUrdu
              : labels.agreeCheckboxLabelEnglish}
          </span>
        </label>

        {/* Optional WhatsApp number field (only stored if she agrees) */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="whatsapp-number-input"
            className="text-base font-bold text-[var(--color-text)]"
          >
            {labels.whatsappNumberLabel}
          </label>
          <input
            id="whatsapp-number-input"
            data-testid="whatsapp-number-input"
            type="tel"
            dir="ltr"
            disabled={!agreeToShareContact}
            value={agreeToShareContact ? whatsappNumber : ''}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder={labels.whatsappNumberPlaceholder}
            className={`font-english min-h-[54px] w-full rounded-2xl border px-4 py-3 text-lg text-[var(--color-text)] tabular-nums placeholder:text-[var(--color-text-muted)]/60 focus:outline-2 ${
              agreeToShareContact
                ? 'border-[var(--color-border)] bg-[var(--color-canvas)] focus:border-[var(--color-primary)] focus:outline-[var(--color-primary)]'
                : 'border-[var(--color-border)] bg-[var(--color-canvas)]/50 opacity-60 cursor-not-allowed'
            }`}
          />
          <span className="text-sm font-medium text-[var(--color-text-muted)]">
            {labels.whatsappOnlyStoredNote}
          </span>
        </div>
      </div>

      {validationError && (
        <p
          role="alert"
          data-testid="save-shop-error"
          className="text-base font-bold text-[var(--color-primary)]"
        >
          {validationError}
        </p>
      )}

      {statusMessage && (
        <p
          role="status"
          data-testid="shop-status-message"
          className="text-base font-bold text-[var(--color-primary)]"
        >
          {statusMessage}
        </p>
      )}

      {/* Save Shop Button */}
      <button
        type="button"
        id="save-shop-btn"
        data-testid="save-shop-btn"
        disabled={isSaving || isUpdatingStatus}
        onClick={handleSaveShop}
        className="flex min-h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-[var(--color-primary)] px-6 py-4 text-center text-xl font-bold text-white shadow-xs transition-transform duration-150 hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      >
        {isSaving ? (
          <>
            <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin shrink-0" />
            <span>{labels.savingShopButton}</span>
          </>
        ) : (
          <>
            <Store aria-hidden="true" className="h-5 w-5 shrink-0" />
            <span>
              {savedShop ? labels.updateShopButton : labels.saveShopButton}
            </span>
          </>
        )}
      </button>

      {/* Saved Shop Actions: View /shop/:id, Hide/Unhide, Delete */}
      {savedShop && (
        <div
          data-testid="saved-shop-controls"
          className="flex flex-col gap-4 border-t border-[var(--color-border)] pt-5"
        >
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold text-[var(--color-primary)]">
              {labels.shopSavedTitle}
            </span>
            <span
              dir="ltr"
              data-testid="saved-shop-path"
              className="font-english text-sm font-semibold text-[var(--color-text-muted)] break-all"
            >
              /shop/{savedShop.id}
            </span>
            {savedShop.isHidden && (
              <span
                data-testid="saved-shop-hidden-indicator"
                className="text-sm font-bold text-[var(--color-accent)]"
              >
                {labels.shopHiddenStatus}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              id="open-public-shop-btn"
              data-testid="open-public-shop-btn"
              onClick={() => onOpenPublicShop(savedShop.id)}
              className="flex min-h-[54px] items-center justify-center gap-2.5 rounded-2xl bg-[var(--color-accent)] px-5 py-3 text-lg font-bold text-white transition-transform duration-150 active:scale-[0.98] whitespace-nowrap"
            >
              <ExternalLink aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span>{labels.viewPublicShopButton}</span>
            </button>

            <button
              type="button"
              id="copy-shop-link-btn"
              onClick={handleCopyLink}
              className="flex min-h-[54px] items-center justify-center gap-2.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-5 py-3 text-lg font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-border)] whitespace-nowrap"
            >
              {copiedLink ? (
                <Check aria-hidden="true" className="h-5 w-5 shrink-0" />
              ) : (
                <Copy aria-hidden="true" className="h-5 w-5 shrink-0" />
              )}
              <span>
                {copiedLink
                  ? labels.copiedShopLinkButton
                  : labels.copyShopLinkButton}
              </span>
            </button>

            <button
              type="button"
              id="toggle-hide-shop-btn"
              data-testid="toggle-hide-shop-btn"
              disabled={isUpdatingStatus}
              onClick={handleToggleHide}
              className="flex min-h-[54px] items-center justify-center gap-2.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-5 py-3 text-lg font-bold text-[var(--color-text)] transition-colors hover:bg-[var(--color-border)] whitespace-nowrap"
            >
              {savedShop.isHidden ? (
                <Eye aria-hidden="true" className="h-5 w-5 shrink-0" />
              ) : (
                <EyeOff aria-hidden="true" className="h-5 w-5 shrink-0" />
              )}
              <span>
                {savedShop.isHidden
                  ? labels.unhideShopButton
                  : labels.hideShopButton}
              </span>
            </button>

            <button
              type="button"
              id="delete-shop-btn"
              data-testid="delete-shop-btn"
              disabled={isUpdatingStatus}
              onClick={handleDeleteShop}
              className="flex min-h-[54px] items-center justify-center gap-2.5 rounded-2xl border border-[var(--color-primary)]/40 bg-[var(--color-canvas)] px-5 py-3 text-lg font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white whitespace-nowrap"
            >
              <Trash2 aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span>{labels.deleteShopButton}</span>
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
