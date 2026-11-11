import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Edit3,
  EyeOff,
  Loader2,
  MapPin,
  RefreshCw,
  RotateCcw,
  Store,
  Trash2,
  X,
} from 'lucide-react';
import {
  deleteShopFromFirestore,
  listPublicShopsFromFirestore,
  updateShopVisibilityInFirestore,
} from '../firebase';
import { SkillOptionId, TranslationContent } from '../i18n/translations';
import {
  DirectorySkillFilterId,
  filterPublicShops,
  formatShopPriceRange,
  getAvailableCities,
  isSampleShop,
  SAMPLE_SHOPS,
} from '../utils/shopDirectory';
import { SKILL_OPTION_IDS } from '../utils/skillForm';
import {
  isOwnerOfShop,
  ShopRecord,
  UserProfile,
} from '../utils/shopManager';

interface ShopDirectoryScreenProps {
  content: TranslationContent;
  userProfile: UserProfile | null;
  onSelectShop: (shopId: string) => void;
  onEditMyShop: () => void;
  onShopChanged: (shop: ShopRecord | null) => void;
  onBackToApp: () => void;
}

export function ShopDirectoryScreen({
  content,
  userProfile,
  onSelectShop,
  onEditMyShop,
  onShopChanged,
  onBackToApp,
}: ShopDirectoryScreenProps) {
  const [shops, setShops] = useState<ShopRecord[]>(SAMPLE_SHOPS);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [skillFilter, setSkillFilter] = useState<DirectorySkillFilterId>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [mutatingShopId, setMutatingShopId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const dirLabels = content.directory;
  const myShopLabels = content.myShop;
  const skillOptions = content.skillInput.skillOptions;
  const isRtl = content.dir === 'rtl';

  const loadShops = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);

    listPublicShopsFromFirestore()
      .then((records) => {
        setShops(records);
      })
      .catch(() => {
        setShops(SAMPLE_SHOPS);
        setLoadError(dirLabels.errorLoadFailed);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dirLabels.errorLoadFailed]);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  const availableCities = getAvailableCities(shops);
  const filteredShops = filterPublicShops(shops, skillFilter, cityFilter);

  const handleResetFilters = () => {
    setSkillFilter('all');
    setCityFilter('all');
  };

  const handleHideOwnedShop = async (shop: ShopRecord) => {
    setMutatingShopId(shop.id);
    try {
      await updateShopVisibilityInFirestore(shop.id, true);
      setShops((prev) => prev.filter((s) => s.id !== shop.id));
      onShopChanged({ ...shop, isHidden: true, visible: false });
    } catch {
      setLoadError(content.publicShop.errorActionFailed);
    } finally {
      setMutatingShopId(null);
    }
  };

  const handleDeleteOwnedShop = async (shopId: string) => {
    setMutatingShopId(shopId);
    try {
      await deleteShopFromFirestore(shopId);
      setShops((prev) => prev.filter((s) => s.id !== shopId));
      setConfirmDeleteId(null);
      onShopChanged(null);
    } catch {
      setLoadError(content.publicShop.errorActionFailed);
    } finally {
      setMutatingShopId(null);
    }
  };

  return (
    <section
      aria-labelledby="directory-heading"
      data-testid="shop-directory-page"
      className="mx-auto flex w-full max-w-[500px] flex-1 flex-col gap-6 px-5 py-7 sm:px-6 sm:py-9"
    >
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Store
              aria-hidden="true"
              className="h-8 w-8 shrink-0 text-[var(--color-accent)]"
            />
            <h1
              id="directory-heading"
              className="text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl text-balance"
            >
              {dirLabels.heading}
            </h1>
          </div>

          <button
            type="button"
            id="directory-back-btn"
            onClick={onBackToApp}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5 text-center text-base font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-border)]"
          >
            {isRtl ? (
              <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
            ) : (
              <ArrowLeft aria-hidden="true" className="h-4 w-4 shrink-0" />
            )}
            <span>{content.publicShop.backToAppButton}</span>
          </button>
        </div>

        <p className="max-w-2xl text-lg font-medium text-[var(--color-text-muted)]">
          {dirLabels.subtitle}
        </p>
      </div>

      {/* Filters for Skill and City */}
      <div
        data-testid="directory-filters"
        className="grid grid-cols-1 gap-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
      >
        {/* Skill Filter */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="directory-skill-filter"
            className="text-base font-bold text-[var(--color-text)]"
          >
            {dirLabels.skillFilterLabel}
          </label>
          <select
            id="directory-skill-filter"
            data-testid="directory-skill-filter"
            value={skillFilter}
            onChange={(e) =>
              setSkillFilter(e.target.value as DirectorySkillFilterId)
            }
            className="min-h-[54px] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-3 text-lg font-semibold text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-2 focus:outline-[var(--color-primary)]"
          >
            <option value="all">{dirLabels.allSkillsOption}</option>
            {SKILL_OPTION_IDS.map((optId: SkillOptionId) => (
              <option key={optId} value={optId}>
                {skillOptions[optId]}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="directory-city-filter"
            className="text-base font-bold text-[var(--color-text)]"
          >
            {dirLabels.cityFilterLabel}
          </label>
          <select
            id="directory-city-filter"
            data-testid="directory-city-filter"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="min-h-[54px] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-3 text-lg font-semibold text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-2 focus:outline-[var(--color-primary)]"
          >
            <option value="all">{dirLabels.allCitiesOption}</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div
          role="status"
          data-testid="directory-loading"
          className="flex items-center justify-center gap-3 py-4 text-lg font-semibold text-[var(--color-text-muted)]"
        >
          <Loader2
            aria-hidden="true"
            className="h-5 w-5 animate-spin text-[var(--color-accent)]"
          />
          <span>{dirLabels.loadingTitle}</span>
        </div>
      )}

      {/* Error Banner with Retry */}
      {!isLoading && loadError && (
        <div
          role="alert"
          data-testid="directory-error-banner"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-primary)]/30 bg-[var(--color-surface)] px-5 py-4"
        >
          <span className="text-base font-bold text-[var(--color-primary)]">
            {loadError}
          </span>
          <button
            type="button"
            id="directory-retry-btn"
            data-testid="directory-retry-btn"
            onClick={loadShops}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-base font-bold text-white"
          >
            <RefreshCw aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{dirLabels.retryButton}</span>
          </button>
        </div>
      )}

      {/* Shop Cards Grid */}
      {filteredShops.length === 0 ? (
        <div
          data-testid="directory-empty-state"
          className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center"
        >
          <p className="text-lg font-bold text-[var(--color-text-muted)]">
            {dirLabels.noMatchingShops}
          </p>
          <button
            type="button"
            id="directory-reset-filters-btn"
            data-testid="directory-reset-filters-btn"
            onClick={handleResetFilters}
            className="flex min-h-[52px] items-center justify-center gap-2.5 rounded-2xl bg-[var(--color-primary)] px-6 py-3 text-lg font-bold text-white transition-transform duration-150 active:scale-[0.98] whitespace-nowrap"
          >
            <RotateCcw aria-hidden="true" className="h-5 w-5 shrink-0" />
            <span>{dirLabels.resetFiltersButton}</span>
          </button>
        </div>
      ) : (
        <div
          data-testid="directory-shops-grid"
          className="grid grid-cols-1 gap-5"
        >
          {filteredShops.map((shop) => {
            const sample = isSampleShop(shop);
            const isOwnedByCurrentUser = isOwnerOfShop(shop, userProfile?.uid);
            const priceRange = formatShopPriceRange(
              shop.products,
              dirLabels.priceNotSet
            );
            const coverPhoto =
              shop.photos && shop.photos.length > 0 ? shop.photos[0] : null;
            const isBusy = mutatingShopId === shop.id;

            return (
              <article
                key={shop.id}
                data-testid={`directory-shop-card-${shop.id}`}
                className="flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-primary)]/50"
              >
                <button
                  type="button"
                  id={`open-shop-card-${shop.id}`}
                  data-testid={`open-shop-card-${shop.id}`}
                  onClick={() => onSelectShop(shop.id)}
                  className="group flex h-full w-full cursor-pointer flex-col text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                >
                  {/* Shop Photo */}
                  <div className="relative aspect-video w-full overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-canvas)]">
                    {coverPhoto ? (
                      <img
                        src={coverPhoto}
                        alt={shop.shopName}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[var(--color-accent)]">
                        <Store className="h-12 w-12" />
                      </div>
                    )}
                  </div>

                  {/* Card Body: Sample data label, Name, Skill, City, Price Range */}
                  <div className="flex flex-1 flex-col justify-between gap-4 p-6">
                    <div className="flex flex-col gap-2">
                      {sample && (
                        <div
                          data-testid={`sample-data-badge-${shop.id}`}
                          className="text-sm font-bold text-[var(--color-accent)]"
                        >
                          <span>
                            {content.lang === 'ur'
                              ? dirLabels.sampleDataBadgeUrdu
                              : dirLabels.sampleDataBadgeEnglish}
                          </span>
                        </div>
                      )}

                      {isOwnedByCurrentUser && (
                        <div
                          data-testid={`owner-shop-badge-${shop.id}`}
                          className="text-sm font-bold text-[var(--color-primary)]"
                        >
                          {dirLabels.ownerBadgeLabel}
                        </div>
                      )}

                      <h2
                        data-testid={`directory-shop-name-${shop.id}`}
                        className="text-xl font-bold text-[var(--color-primary)] sm:text-2xl"
                      >
                        {shop.shopName}
                      </h2>

                      <div className="mt-1 flex flex-wrap items-center gap-2.5 text-base font-bold text-[var(--color-text-muted)]">
                        <span data-testid={`directory-shop-skill-${shop.id}`}>
                          {shop.skill}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          data-testid={`directory-shop-city-${shop.id}`}
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

                    {/* Price Range & Open Shop CTA */}
                    <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-[var(--color-border)] pt-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-[var(--color-text-muted)]">
                          {dirLabels.priceRangeLabel}
                        </span>
                        <span
                          dir="ltr"
                          data-testid={`directory-shop-price-range-${shop.id}`}
                          className="font-english text-lg font-bold text-[var(--color-primary)] tabular-nums"
                        >
                          {priceRange}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1.5 text-base font-bold text-[var(--color-primary)] group-hover:underline whitespace-nowrap">
                        <span>{dirLabels.openShopLabel}</span>
                        {isRtl ? (
                          <ArrowLeft
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0"
                          />
                        ) : (
                          <ArrowRight
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0"
                          />
                        )}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Edit / Hide / Delete controls ONLY on the shop that belongs to the logged-in user */}
                {isOwnedByCurrentUser && (
                  <div
                    data-testid={`directory-owner-controls-${shop.id}`}
                    className="flex flex-col gap-3 border-t border-[var(--color-border)] bg-[var(--color-canvas)]/70 px-6 py-4"
                  >
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        id={`dir-edit-shop-${shop.id}`}
                        data-testid={`dir-edit-shop-${shop.id}`}
                        disabled={isBusy}
                        onClick={onEditMyShop}
                        className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-border)]"
                      >
                        <Edit3 aria-hidden="true" className="h-4 w-4 shrink-0" />
                        <span>{dirLabels.editShopButton}</span>
                      </button>

                      <button
                        type="button"
                        id={`dir-hide-shop-${shop.id}`}
                        data-testid={`dir-hide-shop-${shop.id}`}
                        disabled={isBusy}
                        onClick={() => handleHideOwnedShop(shop)}
                        className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-bold text-[var(--color-text)] hover:bg-[var(--color-border)]"
                      >
                        <EyeOff aria-hidden="true" className="h-4 w-4 shrink-0" />
                        <span>{dirLabels.hideShopButton}</span>
                      </button>

                      <button
                        type="button"
                        id={`dir-delete-shop-${shop.id}`}
                        data-testid={`dir-delete-shop-${shop.id}`}
                        disabled={isBusy}
                        onClick={() => setConfirmDeleteId(shop.id)}
                        className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[var(--color-primary)]/40 bg-[var(--color-surface)] px-3 py-2 text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4 shrink-0" />
                        <span>{dirLabels.deleteShopButton}</span>
                      </button>
                    </div>

                    {confirmDeleteId === shop.id && (
                      <div
                        role="alertdialog"
                        data-testid={`dir-delete-confirm-${shop.id}`}
                        className="flex flex-col gap-2.5 rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-surface)] p-4"
                      >
                        <p className="text-sm font-bold text-[var(--color-primary)]">
                          {myShopLabels.deleteConfirmTitle}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            id={`dir-confirm-delete-${shop.id}`}
                            data-testid={`dir-confirm-delete-${shop.id}`}
                            disabled={isBusy}
                            onClick={() => handleDeleteOwnedShop(shop.id)}
                            className="flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-3 py-2 text-xs font-bold text-white"
                          >
                            <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                            <span>{myShopLabels.confirmDeleteButton}</span>
                          </button>
                          <button
                            type="button"
                            id={`dir-cancel-delete-${shop.id}`}
                            onClick={() => setConfirmDeleteId(null)}
                            className="flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-xs font-bold text-[var(--color-text)]"
                          >
                            <X aria-hidden="true" className="h-3.5 w-3.5" />
                            <span>{myShopLabels.cancelDeleteButton}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
