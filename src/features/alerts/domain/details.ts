import type { Alert } from '../types';

export interface DetailField {
  key: string;
  unit?: string;
}

export const DETAIL_FIELDS: DetailField[] = [
  { key: 'cpuPercent', unit: '%' },
  { key: 'memoryPercent', unit: '%' },
  { key: 'inletC', unit: '°C' },
  { key: 'consumedW', unit: 'W' },
  { key: 'minutesRemaining', unit: 'min' },
  { key: 'failures' },
];

export interface DetailValue extends DetailField {
  value: number;
}

export const latestDetails = (alert: Pick<Alert, 'details'>): DetailValue[] => {
  const latest = alert.details?.latest ?? {};
  return DETAIL_FIELDS.flatMap((field) => {
    const value = latest[field.key];
    return typeof value === 'number' ? [{ ...field, value }] : [];
  });
};
