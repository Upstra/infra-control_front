export type PresenceStatus = 'active' | 'idle';

export interface PresenceView {
  userId: string;
  online: boolean;
  status: PresenceStatus | null;
  route: string | null;
  title: string | null;
  lastActivityAt: string | null;
}

export interface PresencePing {
  route?: string;
  title?: string;
  active?: boolean;
}
