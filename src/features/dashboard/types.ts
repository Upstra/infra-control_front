export interface FullDashboardStatsDto {
  totalUsers: number;
  adminUsers: number;
  totalRooms: number;
  totalUps: number;
  totalServers: number;
  totalVms: number;
  serversUp: number;
  serversDown: number;
  vmsUp: number;
  vmsDown: number;
  setupComplete: boolean;
  setupProgress: number;
  onlineUsers: number;
  hostsTotal?: number;
  hostsConnected?: number;
  vmsByHealth?: Record<'up' | 'degraded' | 'down' | 'unknown', number>;
  totalPowerW?: number | null;
  totalCapacityW?: number | null;
  maxInletC?: number | null;
  maxInletRoomId?: string | null;
  maxInletServerName?: string | null;
  upsOnBattery?: number;
  openAlerts?: Record<'critical' | 'warning' | 'info', number>;
}

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type WidgetType =
  | 'incident'
  | 'kpis'
  | 'ups'
  | 'vms'
  | 'hosts'
  | 'events'
  | 'power'
  | 'presence'
  | 'stats'
  | 'activity-feed'
  | 'alerts'
  | 'user-presence'
  | 'system-health'
  | 'ups-status';

export interface Widget {
  id: string;
  type: WidgetType;
  title?: string;
  position: WidgetPosition;
  settings?: Record<string, any>;
  refreshInterval?: number;
  visible?: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  columns: number;
  rowHeight: number;
  isDefault: boolean;
  userId: string;
  widgets: Widget[];
  createdAt: string;
  updatedAt: string;
}

export interface SystemComponent {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime: number;
  uptime: number | null;
  issues?: string[];
}

export interface SystemHealthResponse {
  status: 'healthy' | 'degraded' | 'critical';
  score: number;
  components: SystemComponent[];
  lastCheck: string;
}
