export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'open' | 'resolved';
export type AlertResourceType = 'ups' | 'server' | 'vm' | 'room';

export type AlertType =
  | 'ups_on_battery'
  | 'ups_low_battery'
  | 'ups_unreachable'
  | 'ups_overload'
  | 'ups_replace_battery'
  | 'vm_powered_off'
  | 'vm_heartbeat_lost'
  | 'host_disconnected'
  | 'host_cpu_high'
  | 'server_inlet_temperature_high'
  | 'server_psu_degraded'
  | 'server_health_degraded'
  | 'server_ilo_unreachable';

export type AlertTransitionType =
  | 'opened'
  | 'escalated'
  | 'deescalated'
  | 'acknowledged'
  | 'unacknowledged'
  | 'resolved';

export interface AlertTransition {
  id: string;
  type: AlertTransitionType;
  at: string;
  byUserId: string | null;
  byUsername: string | null;
  fromSeverity: AlertSeverity | null;
  toSeverity: AlertSeverity | null;
}

export interface Alert {
  id: string;
  dedupKey: string;
  type: AlertType | string;
  severity: AlertSeverity;
  status: AlertStatus;
  resourceType: AlertResourceType;
  resourceId: string;
  resourceName: string;
  title: string;
  message: string;
  details: {
    atOpen?: Record<string, unknown> | null;
    latest?: Record<string, unknown> | null;
  } | null;
  openedAt: string;
  lastSeenAt: string;
  resolvedAt: string | null;
  acknowledgedAt: string | null;
  acknowledgedById: string | null;
  acknowledged: boolean;
  occurrences: number;
  transitions?: AlertTransition[];
}

export interface AlertSummary {
  open: Record<AlertSeverity, number>;
  unacknowledgedCritical: number;
}

export interface AlertListParams {
  status?: AlertStatus;
  severity?: AlertSeverity;
  resourceType?: AlertResourceType;
  page?: number;
  limit?: number;
}

export interface AlertListResponse {
  items: Alert[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}
