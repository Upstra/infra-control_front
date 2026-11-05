import type { PresenceView } from '../types';

export type PresenceLine =
  | { kind: 'page'; title: string }
  | { kind: 'idle'; since: string | null }
  | { kind: 'hidden' };

export const presenceLine = (view: PresenceView): PresenceLine => {
  if (view.status === 'idle')
    return { kind: 'idle', since: view.lastActivityAt };
  if (!view.route && !view.title) return { kind: 'hidden' };
  return { kind: 'page', title: view.title || view.route || '' };
};

export const sortPresence = (views: PresenceView[], selfId: string | null) =>
  [...views].sort(
    (a, b) =>
      Number(b.userId === selfId) - Number(a.userId === selfId) ||
      Number(b.status === 'active') - Number(a.status === 'active'),
  );
