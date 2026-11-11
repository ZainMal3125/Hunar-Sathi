import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import {
  deleteShopFromFirestore,
  listAllShopsForAdminFromFirestore,
  updateShopVisibilityInFirestore,
} from '../firebase';
import { TranslationContent } from '../i18n/translations';
import { ShopRecord, UserProfile } from '../utils/shopManager';

interface AdminShopsScreenProps {
  content: TranslationContent;
  userProfile: UserProfile | null;
  onSelectShop: (shopId: string) => void;
  onBackToHome: () => void;
}

export function AdminShopsScreen({
  content,
  userProfile,
  onSelectShop,
  onBackToHome,
}: AdminShopsScreenProps) {
  const [shops, setShops] = useState<ShopRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mutatingShopId, setMutatingShopId] = useState<string | null>(null);
  const [confirmDeleteShop, setConfirmDeleteShop] = useState<ShopRecord | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const labels = content.admin;
  const authLabels = content.auth;
  const isRtl = content.dir === 'rtl';
  const isAdmin = userProfile?.role === 'admin';

  const loadAllShops = useCallback(async () => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const records = await listAllShopsForAdminFromFirestore();
      setShops(records);
    } catch {
      setErrorMessage(labels.errorLoadFailed);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, labels.errorLoadFailed]);

  useEffect(() => {
    loadAllShops();
  }, [loadAllShops]);

  // Strict RBAC guard: Non-admin users never see Admin content
  if (!isAdmin) {
    return (
      <section
        role="alert"
        data-testid="admin-permission-denied"
        className="mx-auto flex w-full max-w-[500px] flex-1 flex-col items-center justify-center gap-5 px-5 py-14 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)]">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">
          {authLabels.permissionDeniedTitle}
        </h1>
        <p className="max-w-sm text-base font-medium text-[var(--color-text-muted)]">
          {authLabels.permissionDeniedSubtitle}
        </p>
        <button
          type="button"
          id="admin-denied-back-btn"
          data-testid="admin-denied-back-btn"
          onClick={onBackToHome}
          className="flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-7 py-3.5 text-lg font-bold text-white"
        >
          {isRtl ? (
            <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
          ) : (
            <ArrowLeft aria-hidden="true" className="h-4 w-4 shrink-0" />
          )}
          <span>{content.createFlow.backToHomeButton}</span>
        </button>
      </section>
    );
  }

  const handleToggleVisibility = async (shop: ShopRecord) => {
    setMutatingShopId(shop.id);
    setErrorMessage(null);
    try {
      const nextHidden = !shop.isHidden;
      await updateShopVisibilityInFirestore(shop.id, nextHidden);
      setShops((prev) =>
        prev.map((item) =>
          item.id === shop.id
            ? { ...item, isHidden: nextHidden, visible: !nextHidden }
            : item
        )
      );
    } catch {
      setErrorMessage(labels.errorActionFailed);
    } finally {
      setMutatingShopId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteShop) return;
    const targetId = confirmDeleteShop.id;
    setMutatingShopId(targetId);
    setErrorMessage(null);
    try {
      await deleteShopFromFirestore(targetId);
      setShops((prev) => prev.filter((item) => item.id !== targetId));
      setConfirmDeleteShop(null);
    } catch {
      setErrorMessage(labels.errorActionFailed);
    } finally {
      setMutatingShopId(null);
    }
  };

  return (
    <section
      aria-labelledby="admin-heading"
      data-testid="admin-shops-screen"
      className="mx-auto flex w-full max-w-[500px] flex-1 flex-col gap-6 px-5 py-7 sm:px-6 sm:py-9"
    >
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck
              aria-hidden="true"
              className="h-7 w-7 shrink-0 text-[var(--color-accent)]"
            />
            <h1
              id="admin-heading"
              className="text-2xl font-bold tracking-tight text-[var(--color-primary)] sm:text-3xl"
            >
              {labels.heading}
            </h1>
          </div>

          <button
            type="button"
            id="admin-refresh-btn"
            data-testid="admin-refresh-btn"
            onClick={loadAllShops}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-border)]"
          >
            <RefreshCw aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{labels.refreshButton}</span>
          </button>
        </div>

        <p className="text-base font-medium text-[var(--color-text-muted)]">
          {labels.subtitle}
        </p>

        <div className="text-sm font-bold text-[var(--color-accent)] tabular-nums">
          {labels.totalShopsLabel(shops.length)}
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          data-testid="admin-error-banner"
          className="flex items-center gap-2.5 rounded-2xl border border-[var(--color-primary)]/40 bg-[var(--color-surface)] px-5 py-3.5 text-base font-bold text-[var(--color-primary)]"
        >
          <AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal / Banner */}
      {confirmDeleteShop && (
        <div
          role="alertdialog"
          aria-labelledby="admin-delete-confirm-title"
          data-testid="admin-delete-confirm-dialog"
          className="flex flex-col gap-4 rounded-3xl border-2 border-[var(--color-primary)] bg-[var(--color-surface)] p-5 shadow-sm"
        >
          <h2
            id="admin-delete-confirm-title"
            className="text-lg font-bold text-[var(--color-primary)]"
          >
            {labels.deleteConfirmTitle}
          </h2>
          <p className="text-base font-medium text-[var(--color-text)]">
            {labels.deleteConfirmMessage(confirmDeleteShop.shopName)}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              id="admin-confirm-delete-btn"
              data-testid="admin-confirm-delete-btn"
              disabled={mutatingShopId === confirmDeleteShop.id}
              onClick={handleConfirmDelete}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-base font-bold text-white"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span>{labels.confirmDeleteButton}</span>
            </button>
            <button
              type="button"
              id="admin-cancel-delete-btn"
              data-testid="admin-cancel-delete-btn"
              onClick={() => setConfirmDeleteShop(null)}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-2.5 text-base font-bold text-[var(--color-text)]"
            >
              <X aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span>{labels.cancelDeleteButton}</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div
          role="status"
          data-testid="admin-loading"
          className="flex items-center justify-center gap-3 py-10 text-lg font-bold text-[var(--color-text-muted)]"
        >
          <Loader2
            aria-hidden="true"
            className="h-6 w-6 animate-spin text-[var(--color-accent)]"
          />
          <span>{labels.loadingTitle}</span>
        </div>
      ) : shops.length === 0 ? (
        <div
          data-testid="admin-empty-state"
          className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-lg font-bold text-[var(--color-text-muted)]"
        >
          {labels.emptyTitle}
        </div>
      ) : (
        <div
          data-testid="admin-shops-list"
          className="flex flex-col gap-4"
        >
          {shops.map((shop) => {
            const isBusy = mutatingShopId === shop.id;
            return (
              <article
                key={shop.id}
                data-testid={`admin-shop-row-${shop.id}`}
                className="flex flex-col gap-3.5 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-2xs"
              >
                <div className="flex flex-col gap-1 border-b border-[var(--color-border)] pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2
                      data-testid={`admin-shop-name-${shop.id}`}
                      className="text-lg font-bold text-[var(--color-primary)]"
                    >
                      {shop.name || shop.shopName}
                    </h2>
                    <span
                      data-testid={`admin-shop-status-${shop.id}`}
                      className={`text-xs font-bold ${
                        shop.isHidden
                          ? 'text-[var(--color-primary)]'
                          : 'text-[var(--color-accent)]'
                      }`}
                    >
                      {labels.colStatus}:{' '}
                      {shop.isHidden ? labels.statusHidden : labels.statusVisible}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-sm font-medium text-[var(--color-text-muted)]">
                    <div>
                      <span className="font-bold">{labels.colOwnerEmail}: </span>
                      <span
                        dir="ltr"
                        data-testid={`admin-shop-email-${shop.id}`}
                        className="font-english"
                      >
                        {shop.ownerEmail || labels.ownerEmailUnknown}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin
                        aria-hidden="true"
                        className="h-3.5 w-3.5 text-[var(--color-accent)]"
                      />
                      <span className="font-bold">{labels.colCity}: </span>
                      <span data-testid={`admin-shop-city-${shop.id}`}>
                        {shop.city}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions: View, Hide/Unhide, Delete */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    id={`admin-view-shop-${shop.id}`}
                    data-testid={`admin-view-shop-${shop.id}`}
                    onClick={() => onSelectShop(shop.id)}
                    className="flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-border)]"
                  >
                    <ExternalLink aria-hidden="true" className="h-4 w-4 shrink-0" />
                    <span>{labels.viewShopButton}</span>
                  </button>

                  <button
                    type="button"
                    id={`admin-toggle-hide-${shop.id}`}
                    data-testid={`admin-toggle-hide-${shop.id}`}
                    disabled={isBusy}
                    onClick={() => handleToggleVisibility(shop)}
                    className="flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-sm font-bold text-[var(--color-text)] hover:bg-[var(--color-border)]"
                  >
                    {shop.isHidden ? (
                      <Eye aria-hidden="true" className="h-4 w-4 shrink-0" />
                    ) : (
                      <EyeOff aria-hidden="true" className="h-4 w-4 shrink-0" />
                    )}
                    <span>
                      {shop.isHidden ? labels.unhideButton : labels.hideButton}
                    </span>
                  </button>

                  <button
                    type="button"
                    id={`admin-delete-shop-${shop.id}`}
                    data-testid={`admin-delete-shop-${shop.id}`}
                    disabled={isBusy}
                    onClick={() => setConfirmDeleteShop(shop)}
                    className="flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl border border-[var(--color-primary)]/40 bg-[var(--color-canvas)] px-3 py-2 text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4 shrink-0" />
                    <span>{labels.deleteButton}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
