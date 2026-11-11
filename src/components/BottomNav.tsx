import { Compass, Home, Layers } from 'lucide-react';
import { ScreenId, TranslationContent } from '../i18n/translations';
import { ROUTES } from '../navigation/routes';

interface BottomNavProps {
  activeScreen: ScreenId;
  content: TranslationContent;
  onNavigate: (screen: ScreenId) => void;
}

const ICONS: Record<ScreenId, typeof Home> = {
  welcome: Home,
  skills: Layers,
  guide: Compass,
};

export function BottomNav({
  activeScreen,
  content,
  onNavigate,
}: BottomNavProps) {
  return (
    <nav
      aria-label={content.navAriaLabel}
      className="w-full border-t border-[var(--color-border)] bg-[var(--color-canvas)]"
    >
      <div className="mx-auto grid max-w-xl grid-cols-3 gap-3 px-4 py-2.5 sm:px-6">
        {ROUTES.map((route) => {
          const Icon = ICONS[route.id];
          const isActive = activeScreen === route.id;
          return (
            <button
              key={route.id}
              type="button"
              onClick={() => onNavigate(route.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
                isActive
                  ? 'bg-[var(--color-surface)] text-[var(--color-primary)] font-bold'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]/60 hover:text-[var(--color-text)] font-medium'
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
              <span className="text-sm leading-normal">
                {content.nav[route.id]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
