import type { Alert, AlertResourceType, AlertTransition } from '../types';

const RESOURCE_ROUTES: Record<AlertResourceType, (id: string) => string> = {
  ups: (id) => `/ups/${id}`,
  server: (id) => `/servers/${id}`,
  room: (id) => `/rooms/${id}`,
  vm: () => '/servers',
};

export const resourceLink = (
  alert: Pick<Alert, 'resourceType' | 'resourceId'>,
) => RESOURCE_ROUTES[alert.resourceType]?.(alert.resourceId) ?? '/';

export const lastAcknowledgement = (
  transitions: AlertTransition[] | undefined,
): AlertTransition | null =>
  [...(transitions ?? [])]
    .reverse()
    .find((transition) => transition.type === 'acknowledged') ?? null;

const SECTION_BY_PREFIX: [string, string][] = [
  ['ups_', '/ups'],
  ['server_', '/servers'],
  ['host_', '/servers'],
  ['vm_', '/servers'],
];

export const sectionOf = (alert: Pick<Alert, 'type' | 'resourceType'>) =>
  SECTION_BY_PREFIX.find(([prefix]) => alert.type.startsWith(prefix))?.[1] ??
  (alert.resourceType === 'room' ? '/rooms' : null);

export const criticalBySection = (alerts: Alert[]): Record<string, number> =>
  alerts
    .filter((alert) => alert.severity === 'critical' && !alert.acknowledged)
    .reduce<Record<string, number>>((acc, alert) => {
      const section = sectionOf(alert);
      if (section) acc[section] = (acc[section] ?? 0) + 1;
      return acc;
    }, {});
