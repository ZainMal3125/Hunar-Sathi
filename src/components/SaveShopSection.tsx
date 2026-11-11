import { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  Store,
  Trash2,
  X,
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
  UserProfile,
  validateSaveShopInput,
} from '../utils/shopManager';

export interface DraftSaveShopFields {
  shopName: string;
  agreeToShareContact: boolean;
  whatsappNumber: string;
}

interface SaveShopSectionProps {
  content: TranslationContent;
  userProfile: UserProfile | null;
  skill: string;
  city: string;
  products: ShopProductItem[];
  photos: string[];
  savedShop: ShopRecord | null;
  draftFields: DraftSaveShopFields;
  onDraftChange: (next: DraftSaveShopFields) => void;
  onRequireAuth: () => void;
  onShopSaved: (shop: ShopRecord | null) => void;
  onOpenPublicShop: (shopId: string) => void;
}

export function SaveShopSection({
  content,
  userProfile,
  skill,
  city,
  products,
  photos,
  savedShop,
  draftFields,
  onDraftChange,
  onRequireAuth,
  onShopSaved,
  onOpenPublicShop,
}: SaveShopSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const labels = content.nextStep.saveShop;
  const myShopLabels = content.myShop;

  useEffect(() => {
    if (savedShop && !draftFields.shopName) {
      onDraftChange({
        shopName: savedShop.shopName,
        agreeToShareContact: savedShop.agreeToShareContact,
        whatsappNumber: savedShop.whatsappNumber,
      });
    }
  }, [savedShop, draftFields.shopName, onDraftChange]);

  const { shopName, agreeToShareContact, whatsappNumber } = draftFields;

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

    // Saving the shop from the Create flow requires login; if not logged in, prompt to log in or register first
    if (!userProfile) {
      onRequireAuth();
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveShopToFirestore(
        {
          shopName,
          ownerEmail: userProfile.email,
          skill,
          city,
          agreeToShareContact,
          whatsappNumber: agreeToShareContact ? whatsappNumber : '',
          products,
          photos,
        },
        userProfile.uid
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
        visible: !nextHidden,
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
      setShowDeleteConfirm(false);
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

      {/* Notice if not logged in */}
      {!userProfile && (
        <div
          data-testid="save-shop-login-notice"
          className="flex flex-col gap-3 rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-canvas)] p-4"
        >
          <p className="text-sm font-bold text-[var(--color-text)]">
            {labels.loginToSavePrompt}
          </p>
          <button
            type="button"
            id="save-shop-prompt-login-btn"
            data-testid="save-shop-prompt-login-btn"
            onClick={onRequireAuth}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-[var(--color-primary)]/40 bg-[var(--color-surface)] px-4 py-2 text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
          >
            <LogIn aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{labels.loginToSaveButton}</span>
          </button>
        </div>
      )}

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
          onChange={(e) =>
            onDraftChange({ ...draftFields, shopName: e.target.value })
          }
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
              onDraftChange({
                ...draftFields,
                agreeToShareContact: checked,
                whatsappNumber: checked ? whatsappNumber : '',
              });
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
            onChange={(e) =>
              onDraftChange({ ...draftFields, whatsappNumber: e.target.value })
            }
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

      {/* Saved Shop Actions: View /shop/:id, Hide/Unhide, Delete (only when logged in as owner) */}
      {savedShop && userProfile && (
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
              onClick={() => setShowDeleteConfirm(true)}
              className="flex min-h-[54px] items-center justify-center gap-2.5 rounded-2xl border border-[var(--color-primary)]/40 bg-[var(--color-canvas)] px-5 py-3 text-lg font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white whitespace-nowrap"
            >
              <Trash2 aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span>{labels.deleteShopButton}</span>
            </button>
          </div>

          {showDeleteConfirm && (
            <div
              role="alertdialog"
              data-testid="save-shop-delete-confirm-dialog"
              className="flex flex-col gap-3 rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-canvas)] p-4"
            >
              <p className="text-base font-bold text-[var(--color-primary)]">
                {myShopLabels.deleteConfirmTitle}
              </p>
              <p className="text-sm font-medium text-[var(--color-text)]">
                {myShopLabels.deleteConfirmMessage}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  id="confirm-delete-saved-shop-btn"
                  data-testid="confirm-delete-saved-shop-btn"
                  disabled={isUpdatingStatus}
                  onClick={handleDeleteShop}
                  className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span>{myShopLabels.confirmDeleteButton}</span>
                </button>
                <button
                  type="button"
                  id="cancel-delete-saved-shop-btn"
                  data-testid="cancel-delete-saved-shop-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-bold text-[var(--color-text)]"
                >
                  <X aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span>{myShopLabels.cancelDeleteButton}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
