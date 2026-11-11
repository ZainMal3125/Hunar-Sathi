import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  PlusCircle,
  Save,
  ShoppingBag,
  Store,
  Trash2,
  X,
} from 'lucide-react';
import {
  deleteShopFromFirestore,
  getMyShopFromFirestore,
  saveShopToFirestore,
  updateShopVisibilityInFirestore,
} from '../firebase';
import { TranslationContent } from '../i18n/translations';
import { formatPkr } from '../utils/priceCalculator';
import {
  ShopProductItem,
  ShopRecord,
  UserProfile,
  validateSaveShopInput,
} from '../utils/shopManager';

interface MyShopScreenProps {
  content: TranslationContent;
  userProfile: UserProfile | null;
  onStartCreateFlow: () => void;
  onOpenPublicShop: (shopId: string) => void;
  onRequireLogin: () => void;
  onShopChanged: (shop: ShopRecord | null) => void;
}

export function MyShopScreen({
  content,
  userProfile,
  onStartCreateFlow,
  onOpenPublicShop,
  onRequireLogin,
  onShopChanged,
}: MyShopScreenProps) {
  const [shop, setShop] = useState<ShopRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit form state
  const [editShopName, setEditShopName] = useState('');
  const [editSkill, setEditSkill] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editAgreeContact, setEditAgreeContact] = useState(false);
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editProducts, setEditProducts] = useState<ShopProductItem[]>([]);

  const labels = content.myShop;
  const saveLabels = content.nextStep.saveShop;
  const authLabels = content.auth;

  const populateEditFields = (record: ShopRecord) => {
    setEditShopName(record.shopName);
    setEditSkill(record.skill);
    setEditCity(record.city);
    setEditAgreeContact(record.agreeToShareContact);
    setEditWhatsapp(record.whatsappNumber);
    setEditProducts(record.products.map((p) => ({ ...p })));
  };

  const loadMyShop = useCallback(async () => {
    if (!userProfile) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const record = await getMyShopFromFirestore(userProfile.uid);
      setShop(record);
      onShopChanged(record);
      if (record) {
        populateEditFields(record);
      }
    } catch {
      setErrorMessage(saveLabels.errorSaveFailed);
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, onShopChanged, saveLabels.errorSaveFailed]);

  useEffect(() => {
    loadMyShop();
  }, [loadMyShop]);

  if (!userProfile) {
    return (
      <section
        data-testid="my-shop-login-required"
        className="mx-auto flex w-full max-w-[500px] flex-1 flex-col items-center justify-center gap-5 px-5 py-12 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)]">
          <Store className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">
          {authLabels.loginRequiredTitle}
        </h1>
        <p className="max-w-sm text-base font-medium text-[var(--color-text-muted)]">
          {authLabels.loginRequiredSubtitle}
        </p>
        <button
          type="button"
          id="my-shop-login-btn"
          data-testid="my-shop-login-btn"
          onClick={onRequireLogin}
          className="flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-7 py-3.5 text-lg font-bold text-white"
        >
          <span>{authLabels.loginNavButton}</span>
        </button>
      </section>
    );
  }

  const handleSaveEdit = async () => {
    if (!shop) return;
    setErrorMessage(null);
    setStatusMessage(null);

    const validation = validateSaveShopInput({
      shopName: editShopName,
      skill: editSkill,
      city: editCity,
      agreeToShareContact: editAgreeContact,
      whatsappNumber: editWhatsapp,
      products: editProducts,
      photos: shop.photos,
    });

    if (!validation.isValid) {
      setErrorMessage(
        validation.errorKey === 'shopNameEmpty'
          ? saveLabels.errorShopNameEmpty
          : saveLabels.errorInvalidWhatsapp
      );
      return;
    }

    setIsMutating(true);
    try {
      const updated = await saveShopToFirestore(
        {
          shopName: editShopName,
          ownerEmail: userProfile.email,
          skill: editSkill,
          city: editCity,
          agreeToShareContact: editAgreeContact,
          whatsappNumber: editAgreeContact ? editWhatsapp : '',
          products: editProducts,
          photos: shop.photos,
        },
        shop.id
      );
      setShop(updated);
      onShopChanged(updated);
      setIsEditing(false);
      setStatusMessage(labels.updatedSuccessMessage);
    } catch {
      setErrorMessage(saveLabels.errorSaveFailed);
    } finally {
      setIsMutating(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (!shop) return;
    setIsMutating(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const nextHidden = !shop.isHidden;
      await updateShopVisibilityInFirestore(shop.id, nextHidden);
      const updated: ShopRecord = {
        ...shop,
        isHidden: nextHidden,
        visible: !nextHidden,
      };
      setShop(updated);
      onShopChanged(updated);
    } catch {
      setErrorMessage(content.publicShop.errorActionFailed);
    } finally {
      setIsMutating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!shop) return;
    setIsMutating(true);
    setErrorMessage(null);
    try {
      await deleteShopFromFirestore(shop.id);
      setShop(null);
      onShopChanged(null);
      setShowDeleteConfirm(false);
      setStatusMessage(labels.deletedSuccessMessage);
    } catch {
      setErrorMessage(content.publicShop.errorActionFailed);
    } finally {
      setIsMutating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shop) return;
    const shareUrl = `${window.location.origin}/shop/${shop.id}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      // Fallback
    }
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 2500);
  };

  if (isLoading) {
    return (
      <section
        role="status"
        data-testid="my-shop-loading"
        className="mx-auto flex w-full max-w-[500px] flex-1 flex-col items-center justify-center px-6 py-16 text-center"
      >
        <Loader2
          aria-hidden="true"
          className="mb-4 h-10 w-10 animate-spin text-[var(--color-accent)]"
        />
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">
          {labels.loadingTitle}
        </h1>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="my-shop-heading"
      data-testid="my-shop-screen"
      className="mx-auto flex w-full max-w-[500px] flex-1 flex-col gap-6 px-5 py-7 sm:px-6 sm:py-9"
    >
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Store
            aria-hidden="true"
            className="h-8 w-8 shrink-0 text-[var(--color-accent)]"
          />
          <h1
            id="my-shop-heading"
            className="text-3xl font-bold tracking-tight text-[var(--color-primary)]"
          >
            {labels.heading}
          </h1>
        </div>
        <p className="text-base font-medium text-[var(--color-text-muted)]">
          {labels.subtitle}
        </p>
      </div>

      {statusMessage && (
        <div
          role="status"
          data-testid="my-shop-status-banner"
          className="rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-surface)] px-5 py-3.5 text-base font-bold text-[var(--color-primary)]"
        >
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          data-testid="my-shop-error-banner"
          className="flex items-center gap-2.5 rounded-2xl border border-[var(--color-primary)]/40 bg-[var(--color-surface)] px-5 py-3.5 text-base font-bold text-[var(--color-primary)]"
        >
          <AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Empty State: No shop yet */}
      {!shop ? (
        <article
          data-testid="my-shop-empty-state"
          className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-2xs"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-accent)]">
            <Store className="h-8 w-8" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-[var(--color-primary)]">
              {labels.emptyTitle}
            </h2>
            <p className="max-w-sm text-base font-medium text-[var(--color-text-muted)]">
              {labels.emptySubtitle}
            </p>
          </div>
          <button
            type="button"
            id="my-shop-create-btn"
            data-testid="my-shop-create-btn"
            onClick={onStartCreateFlow}
            className="flex min-h-[58px] w-full items-center justify-center gap-3 rounded-2xl bg-[var(--color-primary)] px-6 py-4 text-center text-xl font-bold text-white shadow-xs transition-transform duration-150 hover:bg-[var(--color-primary-hover)] active:scale-[0.98]"
          >
            <PlusCircle aria-hidden="true" className="h-6 w-6 shrink-0" />
            <span>{labels.createYourShopButton}</span>
          </button>
        </article>
      ) : (
        <>
          {/* Shop Overview & Management Actions Card */}
          <article
            data-testid="my-shop-details-card"
            className="flex flex-col gap-5 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xs sm:p-7"
          >
            <div className="flex flex-col gap-2 border-b border-[var(--color-border)] pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2
                  data-testid="my-shop-name"
                  className="text-2xl font-bold text-[var(--color-primary)]"
                >
                  {shop.shopName}
                </h2>
                <span
                  data-testid="my-shop-visibility-status"
                  className="text-sm font-bold text-[var(--color-accent)]"
                >
                  {labels.statusLabel}{' '}
                  {shop.isHidden ? labels.statusHidden : labels.statusVisible}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-base font-bold text-[var(--color-text-muted)]">
                <span data-testid="my-shop-skill">{shop.skill}</span>
                <span aria-hidden="true">·</span>
                <span
                  data-testid="my-shop-city"
                  className="inline-flex items-center gap-1"
                >
                  <MapPin
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-[var(--color-accent)]"
                  />
                  <span>{shop.city}</span>
                </span>
              </div>
            </div>

            {/* Action Buttons: Edit, Hide/Unhide, Delete */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                id="my-shop-edit-btn"
                data-testid="my-shop-edit-btn"
                disabled={isMutating}
                onClick={() => {
                  populateEditFields(shop);
                  setIsEditing((prev) => !prev);
                }}
                className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-3 text-base font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-border)]"
              >
                <Edit3 aria-hidden="true" className="h-4.5 w-4.5 shrink-0" />
                <span>
                  {isEditing ? labels.cancelEditButton : labels.editShopButton}
                </span>
              </button>

              <button
                type="button"
                id="my-shop-toggle-hide-btn"
                data-testid="my-shop-toggle-hide-btn"
                disabled={isMutating}
                onClick={handleToggleVisibility}
                className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-3 text-base font-bold text-[var(--color-text)] transition-colors hover:bg-[var(--color-border)]"
              >
                {shop.isHidden ? (
                  <Eye aria-hidden="true" className="h-4.5 w-4.5 shrink-0" />
                ) : (
                  <EyeOff aria-hidden="true" className="h-4.5 w-4.5 shrink-0" />
                )}
                <span>
                  {shop.isHidden
                    ? labels.unhideShopButton
                    : labels.hideShopButton}
                </span>
              </button>

              <button
                type="button"
                id="my-shop-delete-btn"
                data-testid="my-shop-delete-btn"
                disabled={isMutating}
                onClick={() => setShowDeleteConfirm(true)}
                className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-[var(--color-primary)]/40 bg-[var(--color-canvas)] px-4 py-3 text-base font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
              >
                <Trash2 aria-hidden="true" className="h-4.5 w-4.5 shrink-0" />
                <span>{labels.deleteShopButton}</span>
              </button>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
              <div
                role="alertdialog"
                aria-labelledby="my-shop-delete-confirm-title"
                data-testid="my-shop-delete-confirm-dialog"
                className="flex flex-col gap-4 rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-canvas)] p-5"
              >
                <h3
                  id="my-shop-delete-confirm-title"
                  className="text-lg font-bold text-[var(--color-primary)]"
                >
                  {labels.deleteConfirmTitle}
                </h3>
                <p className="text-base font-medium text-[var(--color-text)]">
                  {labels.deleteConfirmMessage}
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    id="my-shop-confirm-delete-btn"
                    data-testid="my-shop-confirm-delete-btn"
                    disabled={isMutating}
                    onClick={handleConfirmDelete}
                    className="flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-base font-bold text-white"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4 shrink-0" />
                    <span>{labels.confirmDeleteButton}</span>
                  </button>
                  <button
                    type="button"
                    id="my-shop-cancel-delete-btn"
                    data-testid="my-shop-cancel-delete-btn"
                    disabled={isMutating}
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex min-h-[50px] items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-base font-bold text-[var(--color-text)]"
                  >
                    <X aria-hidden="true" className="h-4 w-4 shrink-0" />
                    <span>{labels.cancelDeleteButton}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Inline Edit Form */}
            {isEditing && (
              <div
                data-testid="my-shop-edit-form"
                className="flex flex-col gap-4 border-t border-[var(--color-border)] pt-5"
              >
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-shop-name-input"
                    className="text-base font-bold text-[var(--color-text)]"
                  >
                    {saveLabels.shopNameLabel}
                  </label>
                  <input
                    id="edit-shop-name-input"
                    data-testid="edit-shop-name-input"
                    type="text"
                    value={editShopName}
                    onChange={(e) => setEditShopName(e.target.value)}
                    className="min-h-[52px] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-base text-[var(--color-text)]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="edit-shop-skill-input"
                      className="text-base font-bold text-[var(--color-text)]"
                    >
                      {content.publicShop.skillLabel}
                    </label>
                    <input
                      id="edit-shop-skill-input"
                      data-testid="edit-shop-skill-input"
                      type="text"
                      value={editSkill}
                      onChange={(e) => setEditSkill(e.target.value)}
                      className="min-h-[52px] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-base text-[var(--color-text)]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="edit-shop-city-input"
                      className="text-base font-bold text-[var(--color-text)]"
                    >
                      {content.publicShop.cityLabel}
                    </label>
                    <input
                      id="edit-shop-city-input"
                      data-testid="edit-shop-city-input"
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="min-h-[52px] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-base text-[var(--color-text)]"
                    />
                  </div>
                </div>

                <label
                  htmlFor="edit-agree-contact-checkbox"
                  className="flex min-h-[44px] cursor-pointer items-center gap-3"
                >
                  <input
                    id="edit-agree-contact-checkbox"
                    type="checkbox"
                    checked={editAgreeContact}
                    onChange={(e) => {
                      setEditAgreeContact(e.target.checked);
                      if (!e.target.checked) setEditWhatsapp('');
                    }}
                    className="h-5 w-5 rounded-md accent-[var(--color-primary)]"
                  />
                  <span className="text-base font-bold text-[var(--color-text)]">
                    {content.lang === 'ur'
                      ? saveLabels.agreeCheckboxLabelUrdu
                      : saveLabels.agreeCheckboxLabelEnglish}
                  </span>
                </label>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="edit-whatsapp-input"
                    className="text-sm font-bold text-[var(--color-text)]"
                  >
                    {saveLabels.whatsappNumberLabel}
                  </label>
                  <input
                    id="edit-whatsapp-input"
                    type="tel"
                    dir="ltr"
                    disabled={!editAgreeContact}
                    value={editAgreeContact ? editWhatsapp : ''}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    className="font-english min-h-[50px] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-base text-[var(--color-text)] disabled:opacity-50"
                  />
                </div>

                <button
                  type="button"
                  id="my-shop-save-edit-btn"
                  data-testid="my-shop-save-edit-btn"
                  disabled={isMutating}
                  onClick={handleSaveEdit}
                  className="flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[var(--color-primary)] px-6 py-3.5 text-lg font-bold text-white shadow-xs transition-transform active:scale-[0.98]"
                >
                  {isMutating ? (
                    <>
                      <Loader2
                        aria-hidden="true"
                        className="h-5 w-5 animate-spin shrink-0"
                      />
                      <span>{labels.savingChangesButton}</span>
                    </>
                  ) : (
                    <>
                      <Save aria-hidden="true" className="h-5 w-5 shrink-0" />
                      <span>{labels.saveChangesButton}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Share / Public Page Links */}
            <div className="grid grid-cols-1 gap-3 border-t border-[var(--color-border)] pt-4 sm:grid-cols-2">
              <button
                type="button"
                id="my-shop-open-public-btn"
                data-testid="my-shop-open-public-btn"
                onClick={() => onOpenPublicShop(shop.id)}
                className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent)] px-4 py-3 text-base font-bold text-white"
              >
                <ExternalLink aria-hidden="true" className="h-4.5 w-4.5 shrink-0" />
                <span>{labels.viewPublicPageButton}</span>
              </button>

              <button
                type="button"
                id="my-shop-copy-link-btn"
                onClick={handleCopyLink}
                className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-3 text-base font-bold text-[var(--color-primary)]"
              >
                {copiedLink ? (
                  <Check aria-hidden="true" className="h-4.5 w-4.5 shrink-0" />
                ) : (
                  <Copy aria-hidden="true" className="h-4.5 w-4.5 shrink-0" />
                )}
                <span>
                  {copiedLink ? labels.copiedLinkButton : labels.copyLinkButton}
                </span>
              </button>
            </div>
          </article>

          {/* Products List */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 px-1">
              <ShoppingBag
                aria-hidden="true"
                className="h-5 w-5 text-[var(--color-accent)]"
              />
              <h2 className="text-xl font-bold text-[var(--color-primary)]">
                {content.publicShop.productsHeading}
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {shop.products.map((prod, idx) => (
                <article
                  key={`${prod.name}-${idx}`}
                  className="flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-lg font-bold text-[var(--color-primary)]">
                      {prod.name}
                    </h3>
                    <span
                      dir="ltr"
                      className="font-english text-base font-bold text-[var(--color-primary)] tabular-nums"
                    >
                      {typeof prod.price === 'number'
                        ? formatPkr(prod.price)
                        : content.publicShop.priceNotSet}
                    </span>
                  </div>
                  <p className="text-base font-medium text-[var(--color-text-muted)]">
                    {prod.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
