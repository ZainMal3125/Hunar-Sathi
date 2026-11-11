import { ScreenId } from '../i18n/translations';

export interface RouteDefinition {
  id: ScreenId;
  path: string;
}

export const ROUTES: RouteDefinition[] = [
  { id: 'welcome', path: '#welcome' },
  { id: 'skills', path: '#skills' },
  { id: 'guide', path: '#guide' },
];

export const DEFAULT_SCREEN: ScreenId = 'welcome';

export function resolveInitialScreen(search: string, hash: string): ScreenId {
  const params = new URLSearchParams(search);
  if (params.get('autostart') === '1') {
    return 'skills';
  }
  const cleanHash = hash.replace(/^#\/?/, '');
  if (cleanHash === 'about') {
    return 'guide';
  }
  if (cleanHash === 'welcome' || cleanHash === 'skills' || cleanHash === 'guide') {
    return cleanHash;
  }
  return DEFAULT_SCREEN;
}

export function getNextScreenOnStart(): ScreenId {
  return 'skills';
}

