import type { Alert, AlertSeverity, AlertSummary } from '../types';

const SEVERITY_RANK: Record<AlertSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

export const compareAlerts = (a: Alert, b: Alert): number =>
  SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
  new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime();

export const sortAlerts = (alerts: Alert[]): Alert[] =>
  [...alerts].sort(compareAlerts);

export const applyAlert = (open: Alert[], alert: Alert): Alert[] => {
  const others = open.filter((item) => item.id !== alert.id);
  return alert.status === 'resolved' ? others : sortAlerts([...others, alert]);
};

export const activeCount = (summary: AlertSummary | null): number =>
  summary ? summary.open.critical + summary.open.warning : 0;

export const EMPTY_SUMMARY: AlertSummary = {
  open: { critical: 0, warning: 0, info: 0 },
  unacknowledgedCritical: 0,
};
