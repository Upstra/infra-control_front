import type { RailItem } from './types';

export const isRailItemActive = (item: RailItem, path: string): boolean =>
  [item.to, ...(item.match ?? [])].some((prefix) =>
    prefix === '/' ? path === '/' : path === prefix || path.startsWith(`${prefix}/`),
  );
