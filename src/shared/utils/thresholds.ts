type Reading = number | null | undefined;

export const isKnown = (value: Reading): value is number =>
  typeof value === 'number' && !Number.isNaN(value);

export const exceeds = (value: Reading, threshold: number) =>
  isKnown(value) && value > threshold;

export const reaches = (value: Reading, threshold: number) =>
  isKnown(value) && value >= threshold;

export const below = (value: Reading, threshold: number) =>
  isKnown(value) && value < threshold;
