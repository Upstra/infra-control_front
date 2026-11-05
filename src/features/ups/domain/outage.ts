import type { BatteryStatus, BatteryStatusChangedEvent } from '../types';

export const applyStatusChange = (
  starts: Record<string, string>,
  event: BatteryStatusChangedEvent,
): Record<string, string> => {
  const next = { ...starts };
  if (event.current) next[event.upsId] = event.at;
  else delete next[event.upsId];
  return next;
};

export const clearEndedOutage = (
  starts: Record<string, string>,
  status: BatteryStatus,
): Record<string, string> => {
  if (status.onBattery !== false || !(status.upsId in starts)) return starts;
  const next = { ...starts };
  delete next[status.upsId];
  return next;
};
