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
}

export interface ServerCreationStat {
  month: string;
  count: number;
}

export interface UPSLoadStat {
  hour: string;
  load: number;
}

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type WidgetType =
  | 'stats'
  | 'activity-feed'
  | 'alerts'
  | 'resource-usage'
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

export interface DashboardPreferences {
  defaultLayoutId?: string;
  refreshInterval: number;
  theme: 'light' | 'dark';
  notifications: {
    alerts: boolean;
    activities: boolean;
  };
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  widgets: Widget[];
}

export interface Activity {
  id: string;
  type: string;
  actor: {
    id: string;
    name: string;
    avatar?: string;
  };
  target: {
    type: string;
    id: string;
    name: string;
  };
  timestamp: string;
  description: string;
}

export interface ActivityFeedResponse {
  activities: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  type: string;
  resource: {
    type: string;
    id: string;
    name: string;
  };
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface AlertsResponse {
  alerts: Alert[];
  summary: {
    critical: number;
    warning: number;
    info: number;
  };
}

export interface ResourceMetric {
  usage: number;
  trend: 'up' | 'down' | 'stable';
  history?: Array<{ timestamp: string; value: number }>;
  total?: string;
  used?: string;
}

export interface ResourceUsageResponse {
  cpu: ResourceMetric;
  memory: ResourceMetric;
  storage: ResourceMetric;
  network: {
    inbound: string;
    outbound: string;
    trend: 'up' | 'down' | 'stable';
  };
}

export interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'active' | 'idle';
  location: string;
  lastSeen: string;
}

export interface UserPresenceResponse {
  onlineUsers: OnlineUser[];
  recentlyOffline: Array<{
    id: string;
    name: string;
    lastSeen: string;
  }>;
  summary: {
    online: number;
    idle: number;
    offline: number;
  };
}

export interface SystemComponent {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime: number;
  uptime: number;
  issues?: string[];
}

export interface SystemHealthResponse {
  status: 'healthy' | 'degraded' | 'critical';
  score: number;
  components: SystemComponent[];
  lastCheck: string;
}

export interface UpsDevice {
  id: string;
  name: string;
  status: 'online' | 'onBattery' | 'offline';
  batteryLevel: number;
  load: number;
  runtime: number;
  temperature: number;
  lastTest: string;
  nextTest: string;
}

export interface UpsStatusResponse {
  ups: UpsDevice[];
  summary: {
    total: number;
    online: number;
    onBattery: number;
    offline: number;
    averageLoad: number;
  };
}
