import { ScreenId } from '../i18n/translations';

export interface RouteDefinition {
  id: ScreenId;
  path: string;
}

export const ROUTES: RouteDefinition[] = [
  { id: 'welcome', path: '#home' },
  { id: 'skills', path: '#create' },
  { id: 'guide', path: '/directory' },
];

export const DEFAULT_SCREEN: ScreenId = 'welcome';

export function resolveInitialScreen(search: string, hash: string): ScreenId {
  const params = new URLSearchParams(search);
  if (params.get('autostart') === '1') {
    return 'skills';
  }
  const cleanHash = hash.replace(/^#\/?/, '');
  if (cleanHash === 'create' || cleanHash === 'skills') {
    return 'skills';
  }
  if (
    cleanHash === 'directory' ||
    cleanHash === 'public-shops' ||
    cleanHash === 'shops' ||
    cleanHash === 'how-it-works' ||
    cleanHash === 'about' ||
    cleanHash === 'guide'
  ) {
    return 'guide';
  }
  if (cleanHash === 'home' || cleanHash === 'welcome') {
    return 'welcome';
  }
  return DEFAULT_SCREEN;
}

export function getNextScreenOnStart(): ScreenId {
  return 'skills';
}



