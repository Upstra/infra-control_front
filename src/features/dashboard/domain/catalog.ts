import type { WidgetType } from '../types';

export type WidgetWidth = 4 | 6 | 8 | 12;

export type PulseWidgetType =
  | 'incident'
  | 'kpis'
  | 'ups'
  | 'vms'
  | 'hosts'
  | 'events'
  | 'power'
  | 'presence'
  | 'alerts'
  | 'system-health';

export interface WidgetSpec {
  widths: WidgetWidth[];
  defaultWidth: WidgetWidth;
}

export const WIDGET_SPECS: Record<PulseWidgetType, WidgetSpec> = {
  incident: { widths: [12], defaultWidth: 12 },
  kpis: { widths: [6, 12], defaultWidth: 12 },
  ups: { widths: [6, 8, 12], defaultWidth: 8 },
  vms: { widths: [6, 8, 12], defaultWidth: 8 },
  hosts: { widths: [4, 6, 8], defaultWidth: 4 },
  events: { widths: [4, 6, 8], defaultWidth: 4 },
  power: { widths: [4, 6, 8, 12], defaultWidth: 6 },
  presence: { widths: [4, 6], defaultWidth: 4 },
  alerts: { widths: [4, 6, 8], defaultWidth: 6 },
  'system-health': { widths: [4, 6], defaultWidth: 4 },
};

export const CATALOG_ORDER: PulseWidgetType[] = [
  'incident',
  'kpis',
  'ups',
  'vms',
  'hosts',
  'events',
  'power',
  'presence',
  'alerts',
  'system-health',
];

const LEGACY_ALIASES: Partial<Record<WidgetType, PulseWidgetType>> = {
  stats: 'kpis',
  'activity-feed': 'events',
  'user-presence': 'presence',
  'ups-status': 'ups',
};

export const canonicalType = (
  type: WidgetType | string,
): PulseWidgetType | null => {
  const alias = LEGACY_ALIASES[type as WidgetType];
  if (alias) return alias;
  return type in WIDGET_SPECS ? (type as PulseWidgetType) : null;
};

export const specOf = (type: WidgetType | string): WidgetSpec | null => {
  const canonical = canonicalType(type);
  return canonical ? WIDGET_SPECS[canonical] : null;
};

export const isAllowedWidth = (type: WidgetType | string, width: number) =>
  specOf(type)?.widths.includes(width as WidgetWidth) ?? false;
