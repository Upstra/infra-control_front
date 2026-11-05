import type { Server } from '../types';

export type PowerAction = 'start' | 'stop' | 'reset';

export type PowerBlock = 'no_ilo' | 'ilo_unreachable' | 'busy' | null;

export const powerBlock = (
  server: Pick<Server, 'ilo'>,
  { iloUnreachable, busy }: { iloUnreachable: boolean; busy: boolean },
): PowerBlock => {
  if (!server.ilo) return 'no_ilo';
  if (iloUnreachable) return 'ilo_unreachable';
  if (busy) return 'busy';
  return null;
};

export interface PowerConfirmation {
  action: Exclude<PowerAction, 'start'>;
  runningVms: number;
  needsMigrationWarning: boolean;
}

export const powerConfirmation = (
  server: Pick<Server, 'type'>,
  action: Exclude<PowerAction, 'start'>,
  runningVms: number,
): PowerConfirmation => ({
  action,
  runningVms,
  needsMigrationWarning: server.type === 'esxi' && runningVms > 0,
});
