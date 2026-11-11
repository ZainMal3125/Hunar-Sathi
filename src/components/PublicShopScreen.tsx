import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Image,
  Loader2,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Store,
  Trash2,
} from 'lucide-react';
import {
  deleteShopFromFirestore,
  getShopFromFirestore,
  updateShopVisibilityInFirestore,
} from '../firebase';
import { TranslationContent } from '../i18n/translations';
import { formatPkr } from '../utils/priceCalculator';
import { isSampleShop } from '../utils/shopDirectory';
import { buildWhatsappContactUrl, ShopRecord } from '../utils/shopManager';

interface PublicShopScreenProps {
  shopId: string;
  content: TranslationContent;
  onBackToApp: () => void;
  onOpenDirectory?: () => void;
  onShopUpdated?: (shop: ShopRecord | null) => void;
}

export function PublicShopScreen({
  shopId,
  content,
  onBackToApp,
  onOpenDirectory,
  onShopUpdated,
}: PublicShopScreenProps) {
  const [shop, setShop] = useState<ShopRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const labels = content.publicShop;
  const isRtl = content.dir === 'rtl';

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setNotFound(false);

    getShopFromFirestore(shopId)
      .then((record) => {
        if (cancelled) return;
        if (!record) {
          setShop(null);
          setNotFound(true);
        } else {
          setShop(record);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shopId]);

  const handleToggleVisibility = async () => {
    if (!shop) return;
    setIsMutating(true);
    setMutationError(null);
    try {
      const nextHidden = !shop.isHidden;
      await updateShopVisibilityInFirestore(shop.id, nextHidden);
      const updated = { ...shop, isHidden: nextHidden };
      setShop(updated);
      onShopUpdated?.(updated);
    } catch {
      setMutationError(labels.errorActionFailed);
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    if (!shop) return;
    setIsMutating(true);
    setMutationError(null);
    try {
      await deleteShopFromFirestore(shop.id);
      setShop(null);
      setNotFound(true);
      onShopUpdated?.(null);
    } catch {
      setMutationError(labels.errorActionFailed);
    } finally {
      setIsMutating(false);
    }
  };

  if (isLoading) {
    return (
      <section
        role="status"
        data-testid="public-shop-loading"
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

  if (notFound || !shop) {
    return (
      <section
        data-testid="public-shop-not-found"
        className="mx-auto flex w-full max-w-[500px] flex-1 flex-col items-center justify-center px-6 py-16 text-center"
      >
        <div
          aria-hidden="true"
          className="mb-6 flex h-18 w-18 items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)]"
        >
          <Store className="h-9 w-9" />
        </div>
        <h1 className="mb-3 text-3xl font-bold text-[var(--color-primary)]">
          {labels.notFoundTitle}
        </h1>
        <p className="mb-8 max-w-md text-lg font-medium text-[var(--color-text-muted)]">
          {labels.notFoundSubtitle}
        </p>
        <button
          type="button"
          id="public-shop-back-btn"
          onClick={onBackToApp}
          className="flex min-h-[58px] items-center justify-center gap-3 rounded-2xl bg-[var(--color-primary)] px-8 py-4 text-center text-lg font-bold text-white"
        >
          <span>{labels.backToAppButton}</span>
        </button>
      </section>
    );
  }

  const whatsappUrl =
    shop.agreeToShareContact && shop.whatsappNumber
      ? buildWhatsappContactUrl(shop.whatsappNumber, shop.shopName)
      : null;

  return (
    <section
      aria-labelledby="public-shop-heading"
      data-testid="public-shop-page"
      className="mx-auto flex w-full max-w-[500px] flex-1 flex-col gap-6 px-5 py-7 sm:px-6 sm:py-9"
    >
      {/* Hidden State Notice */}
      {shop.isHidden ? (
        <article
          data-testid="public-shop-hidden-banner"
          className="flex flex-col items-center gap-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center"
        >
          <EyeOff
            aria-hidden="true"
            className="h-10 w-10 text-[var(--color-accent)]"
          />
          <h1
            id="public-shop-heading"
            className="text-3xl font-bold text-[var(--color-primary)]"
          >
            {labels.hiddenTitle}
          </h1>
          <p className="max-w-md text-lg font-medium text-[var(--color-text-muted)]">
            {labels.hiddenSubtitle}
          </p>
        </article>
      ) : (
        <>
          {/* Shop Header Card: Name, Skill, City, and conditional Contact on WhatsApp */}
          <article
            data-testid="public-shop-header"
            className="flex flex-col gap-5 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
          >
            <div className="flex flex-col gap-2 border-b border-[var(--color-border)] pb-4">
              {isSampleShop(shop) && (
                <div
                  data-testid="public-shop-sample-badge"
                  className="text-sm font-bold text-[var(--color-accent)]"
                >
                  <span>
                    {content.lang === 'ur'
                      ? content.directory.sampleDataBadgeUrdu
                      : content.directory.sampleDataBadgeEnglish}
                  </span>
                </div>
              )}

              <h1
                id="public-shop-heading"
                data-testid="public-shop-name"
                className="text-3xl font-bold text-[var(--color-primary)] sm:text-4xl text-balance"
              >
                {shop.shopName}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-lg font-bold text-[var(--color-text-muted)]">
                <span data-testid="public-shop-skill">
                  {labels.skillLabel}: {shop.skill}
                </span>
                <span aria-hidden="true">·</span>
                <span
                  data-testid="public-shop-city"
                  className="inline-flex items-center gap-1.5"
                >
                  <MapPin aria-hidden="true" className="h-5 w-5 text-[var(--color-accent)]" />
                  <span>
                    {labels.cityLabel}: {shop.city}
                  </span>
                </span>
              </div>
            </div>

            {/* Contact on WhatsApp button — ONLY rendered if she agreed to share */}
            {whatsappUrl && (
              <div className="pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="contact-whatsapp-btn"
                  data-testid="contact-whatsapp-btn"
                  className="flex min-h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-[var(--color-primary)] px-6 py-4 text-xl font-bold text-white shadow-xs transition-transform duration-150 hover:bg-[var(--color-primary-hover)] active:scale-[0.98]"
                >
                  <MessageCircle aria-hidden="true" className="h-6 w-6 shrink-0" />
                  <span>
                    {content.lang === 'ur'
                      ? labels.contactWhatsappButtonUrdu
                      : labels.contactWhatsappButtonEnglish}
                  </span>
                </a>
              </div>
            )}
          </article>

          {/* Products with Prices and Photos */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 px-1">
              <ShoppingBag
                aria-hidden="true"
                className="h-6 w-6 shrink-0 text-[var(--color-accent)]"
              />
              <h2 className="text-2xl font-bold text-[var(--color-primary)]">
                {labels.productsHeading}
              </h2>
            </div>

            <div
              data-testid="public-shop-products"
              className="flex flex-col gap-5"
            >
              {shop.products.map((prod, idx) => (
                <article
                  key={`${prod.name}-${idx}`}
                  data-testid={`public-product-card-${idx}`}
                  className="flex flex-col gap-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-7"
                >
                  {prod.photos && prod.photos.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] aspect-video">
                      <img
                        src={prod.photos[0]}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--color-border)] pb-3">
                    <h3
                      data-testid={`public-product-name-${idx}`}
                      className="text-xl font-bold text-[var(--color-primary)] sm:text-2xl"
                    >
                      {prod.name}
                    </h3>

                    <span
                      dir="ltr"
                      data-testid={`public-product-price-${idx}`}
                      className="font-english text-xl font-bold text-[var(--color-primary)] tabular-nums"
                    >
                      {typeof prod.price === 'number'
                        ? formatPkr(prod.price)
                        : labels.priceNotSet}
                    </span>
                  </div>

                  <p
                    data-testid={`public-product-desc-${idx}`}
                    className="text-lg font-medium text-[var(--color-text)]"
                  >
                    {prod.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {/* Work Photos Gallery */}
          {shop.photos && shop.photos.length > 0 && (
            <article
              data-testid="public-shop-photos"
              className="flex flex-col gap-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-3">
                <Image
                  aria-hidden="true"
                  className="h-6 w-6 shrink-0 text-[var(--color-accent)]"
                />
                <h2 className="text-2xl font-bold text-[var(--color-primary)]">
                  {labels.workPhotosHeading}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {shop.photos.map((photoUrl, idx) => (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] aspect-square"
                  >
                    <img
                      src={photoUrl}
                      alt={`${shop.shopName} work ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </article>
          )}
        </>
      )}

      {/* Owner Controls: Hide / Unhide Shop & Delete Shop */}
      <article
        data-testid="public-shop-manage-card"
        className="flex flex-col gap-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
      >
        <h2 className="text-xl font-bold text-[var(--color-primary)] border-b border-[var(--color-border)] pb-3">
          {labels.manageShopHeading}
        </h2>

        {mutationError && (
          <p
            role="alert"
            data-testid="public-shop-mutation-error"
            className="text-base font-bold text-[var(--color-primary)]"
          >
            {mutationError}
          </p>
        )}

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <button
            type="button"
            id="public-toggle-hide-btn"
            data-testid="public-toggle-hide-btn"
            disabled={isMutating}
            onClick={handleToggleVisibility}
            className="flex min-h-[56px] items-center justify-center gap-2.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-5 py-3 text-center text-lg font-bold text-[var(--color-text)] transition-colors hover:bg-[var(--color-border)]"
          >
            {shop.isHidden ? (
              <Eye aria-hidden="true" className="h-5 w-5 shrink-0" />
            ) : (
              <EyeOff aria-hidden="true" className="h-5 w-5 shrink-0" />
            )}
            <span>
              {shop.isHidden ? labels.unhideShopButton : labels.hideShopButton}
            </span>
          </button>

          <button
            type="button"
            id="public-delete-shop-btn"
            data-testid="public-delete-shop-btn"
            disabled={isMutating}
            onClick={handleDelete}
            className="flex min-h-[56px] items-center justify-center gap-2.5 rounded-2xl border border-[var(--color-primary)]/40 bg-[var(--color-canvas)] px-5 py-3 text-center text-lg font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
          >
            <Trash2 aria-hidden="true" className="h-5 w-5 shrink-0" />
            <span>{labels.deleteShopButton}</span>
          </button>
        </div>

        {onOpenDirectory && (
          <button
            type="button"
            id="public-open-directory-btn"
            data-testid="public-open-directory-btn"
            onClick={onOpenDirectory}
            className="mt-1 flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-5 py-3 text-center text-lg font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-border)]"
          >
            <Store aria-hidden="true" className="h-5 w-5 shrink-0" />
            <span>{content.directory.browseDirectoryButton}</span>
          </button>
        )}

        <button
          type="button"
          id="public-back-to-app-btn"
          onClick={onBackToApp}
          className="mt-1 flex min-h-[56px] w-full items-center justify-center gap-3 rounded-2xl bg-[var(--color-primary)] px-6 py-3.5 text-center text-lg font-bold text-white transition-transform duration-150 active:scale-[0.98]"
        >
          {isRtl ? (
            <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0" />
          ) : (
            <ArrowLeft aria-hidden="true" className="h-5 w-5 shrink-0" />
          )}
          <span>{labels.backToAppButton}</span>
        </button>
      </article>
    </section>
  );
}
