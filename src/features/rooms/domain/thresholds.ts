import type { RoomThresholds } from '../types';

export const THRESHOLD_MIN = 0;
export const THRESHOLD_MAX = 80;
export const FALLBACK_WARN_C = 30;

// `v-model` on `<input type="number">` hands back a number (or '' when empty),
// so the inputs are not guaranteed to stay strings.
export interface ThresholdInputs {
  warn: string | number;
  crit: string | number;
}

export type ThresholdError =
  | 'out_of_range'
  | 'warn_not_below_crit'
  | 'not_a_number';

export const parseThreshold = (
  value: string | number | null | undefined,
): number | null => {
  if (typeof value === 'number') return Number.isNaN(value) ? null : value;
  const trimmed = (value ?? '').trim();
  return trimmed === '' ? null : Number(trimmed.replace(',', '.'));
};

const inRange = (value: number | null) =>
  value === null || (value >= THRESHOLD_MIN && value <= THRESHOLD_MAX);

export const validateThresholds = ({
  warn,
  crit,
}: ThresholdInputs): ThresholdError | null => {
  const w = parseThreshold(warn);
  const c = parseThreshold(crit);
  if ((w !== null && Number.isNaN(w)) || (c !== null && Number.isNaN(c)))
    return 'not_a_number';
  if (!inRange(w) || !inRange(c)) return 'out_of_range';
  if (w !== null && c !== null && w >= c) return 'warn_not_below_crit';
  return null;
};

export const toThresholds = ({
  warn,
  crit,
}: ThresholdInputs): Required<RoomThresholds> => ({
  inletWarnC: parseThreshold(warn),
  inletCritC: parseThreshold(crit),
});

export const thresholdInputs = (
  room: RoomThresholds | null | undefined,
): ThresholdInputs => ({
  warn: room?.inletWarnC?.toString() ?? '',
  crit: room?.inletCritC?.toString() ?? '',
});

export const isInletWarning = (
  maxInletC: number | null | undefined,
  inletWarnC: number | null | undefined,
) =>
  maxInletC !== null &&
  maxInletC !== undefined &&
  maxInletC > (inletWarnC ?? FALLBACK_WARN_C);
