import { describe, it, expect } from 'vitest';
import { mergeHead, appendPage } from '../domain';
import type { FeedItem } from '../types';

const item = (id: string): FeedItem => ({
  id,
  kind: 'alert',
  tone: 'critical',
  event: 'opened',
  title: id,
  resource: null,
  at: '2026-11-04T20:05:00.000Z',
  by: null,
  alertId: null,
});

describe('feed domain', () => {
  it('puts only new entries at the head', () => {
    expect(
      mergeHead([item('b'), item('a')], [item('c'), item('b')]).map(
        (i) => i.id,
      ),
    ).toEqual(['c', 'b', 'a']);
  });

  it('appends the next page without duplicates', () => {
    expect(
      appendPage([item('c'), item('b')], [item('b'), item('a')]).map(
        (i) => i.id,
      ),
    ).toEqual(['c', 'b', 'a']);
  });
});
