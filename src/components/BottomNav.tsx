import { Compass, Home, PlusCircle } from 'lucide-react';
import { ScreenId, TranslationContent } from '../i18n/translations';
import { ROUTES } from '../navigation/routes';

interface BottomNavProps {
  activeScreen: ScreenId | null;
  content: TranslationContent;
  onNavigate: (screen: ScreenId) => void;
}

const ICONS: Record<ScreenId, typeof Home> = {
  welcome: Home,
  skills: PlusCircle,
  guide: Compass,
};

const TAB_IDS: Record<ScreenId, string> = {
  welcome: 'nav-tab-home',
  skills: 'nav-tab-create',
  guide: 'nav-tab-how-it-works',
};

export function BottomNav({
  activeScreen,
  content,
  onNavigate,
}: BottomNavProps) {
  return (
    <nav
      aria-label={content.navAriaLabel}
      className="sticky bottom-0 z-20 w-full border-t border-[var(--color-border)] bg-[var(--color-canvas)]"
    >
      <div className="mx-auto grid w-full max-w-[500px] grid-cols-3 gap-2 px-3 py-2.5 sm:px-5">
        {ROUTES.map((route) => {
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
              className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
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
              <span className="text-sm leading-tight">
                {content.nav[route.id]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

