import type { PresencePing } from '../types';

export const PING_INTERVAL_MS = 30_000;
export const TITLE_MAX = 255;

export const routePing = (
  route: string,
  title: string | null | undefined,
): PresencePing => ({
  route: route.startsWith('/') ? route : `/${route}`,
  title: (title ?? '').slice(0, TITLE_MAX),
});

export const backgroundPing = (): PresencePing => ({ active: false });
