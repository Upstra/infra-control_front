export interface OutageSources {
  onBatterySince?: string | null;
  statusChangedAt?: string | null;
  alertOpenedAt?: string | null;
}

export const outageStartOf = ({
  onBatterySince,
  statusChangedAt,
  alertOpenedAt,
}: OutageSources): string | null =>
  onBatterySince ?? statusChangedAt ?? alertOpenedAt ?? null;

export interface Countdown {
  elapsedSeconds: number;
  remainingSeconds: number;
  stopAt: Date;
  expired: boolean;
}

export const shutdownCountdown = (
  start: string | null,
  gracePeriodOffSeconds: number,
  now: number,
): Countdown | null => {
  if (!start) return null;
  const startMs = new Date(start).getTime();
  if (Number.isNaN(startMs)) return null;
  const elapsedSeconds = Math.max(0, (now - startMs) / 1000);
  const remainingSeconds = Math.max(0, gracePeriodOffSeconds - elapsedSeconds);
  return {
    elapsedSeconds,
    remainingSeconds,
    stopAt: new Date(startMs + gracePeriodOffSeconds * 1000),
    expired: remainingSeconds <= 0,
  };
};
