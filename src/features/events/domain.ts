import type { FeedItem } from './types';

export const mergeHead = (
  current: FeedItem[],
  head: FeedItem[],
): FeedItem[] => {
  const known = new Set(current.map((item) => item.id));
  const fresh = head.filter((item) => !known.has(item.id));
  return [...fresh, ...current];
};

export const appendPage = (
  current: FeedItem[],
  page: FeedItem[],
): FeedItem[] => {
  const known = new Set(current.map((item) => item.id));
  return [...current, ...page.filter((item) => !known.has(item.id))];
};
