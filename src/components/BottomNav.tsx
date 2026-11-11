import { Home, PlusCircle, ShieldCheck, Store, UserCheck } from 'lucide-react';
import { ScreenId, TranslationContent } from '../i18n/translations';
import { getVisibleRoutes } from '../navigation/routes';

interface BottomNavProps {
  activeScreen: ScreenId | null;
  content: TranslationContent;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onNavigate: (screen: ScreenId) => void;
}

const ICONS: Record<ScreenId, typeof Home> = {
  welcome: Home,
  skills: PlusCircle,
  guide: Store,
  myShop: UserCheck,
  admin: ShieldCheck,
};

const TAB_IDS: Record<ScreenId, string> = {
  welcome: 'nav-tab-home',
  skills: 'nav-tab-create',
  guide: 'nav-tab-public-shops',
  myShop: 'nav-tab-my-shop',
  admin: 'nav-tab-admin',
};

export function BottomNav({
  activeScreen,
  content,
  isLoggedIn,
  isAdmin,
  onNavigate,
}: BottomNavProps) {
  const visibleRoutes = getVisibleRoutes(isLoggedIn, isAdmin);
  const gridColsClass =
    visibleRoutes.length === 5
      ? 'grid-cols-5'
      : visibleRoutes.length === 4
      ? 'grid-cols-4'
      : 'grid-cols-3';

  return (
    <nav
      aria-label={content.navAriaLabel}
      className="sticky bottom-0 z-20 w-full border-t border-[var(--color-border)] bg-[var(--color-canvas)]"
    >
      <div
        className={`mx-auto grid w-full max-w-[500px] ${gridColsClass} gap-1.5 px-2.5 py-2 sm:px-4`}
      >
        {visibleRoutes.map((route) => {
          const Icon = ICONS[route.id];
          const isActive = activeScreen === route.id;
          const tabId = TAB_IDS[route.id];
          return (
            <button
              key={route.id}
              id={tabId}
              data-testid={tabId}
              type="button"
              onClick={() => onNavigate(route.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-1.5 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
                isActive
                  ? 'border border-[var(--color-primary)]/30 bg-[var(--color-surface)] text-[var(--color-primary)] font-bold shadow-2xs'
                  : 'border border-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]/60 hover:text-[var(--color-text)] font-medium'
              }`}
            >
              <Icon
                aria-hidden="true"
                className={`h-5 w-5 shrink-0 ${
                  isActive
                    ? 'text-[var(--color-accent)] stroke-[2.25]'
                    : 'text-[var(--color-text-muted)] stroke-[1.75]'
                }`}
              />
              <span className="text-xs leading-tight sm:text-sm truncate max-w-full">
                {content.nav[route.id]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
