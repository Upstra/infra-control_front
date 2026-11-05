import type { AlertSeverity, AlertResourceType } from '@/features/alerts/types';

export type FeedKind = 'alert' | 'action';

export interface FeedItem {
  id: string;
  kind: FeedKind;
  tone: AlertSeverity;
  event: string;
  title: string;
  resource: { type: AlertResourceType; id: string; name: string } | null;
  at: string;
  by: { id: string; username: string } | null;
  alertId: string | null;
}

export interface FeedPage {
  items: FeedItem[];
  nextCursor: string | null;
}

export interface FeedParams {
  limit?: number;
  cursor?: string | null;
  from?: string;
  to?: string;
}
