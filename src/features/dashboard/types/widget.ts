export type WidgetSize =
  | 'small'
  | 'medium'
  | 'large'
  | 'wide'
  | 'tall'
  | 'full';

export type WidgetType =
  | 'stats'
  | 'chart'
  | 'quick-actions'
  | 'server-status'
  | 'ups-status'
  | 'activity-feed'
  | 'alerts'
  | 'resource-usage'
  | 'user-presence'
  | 'system-health';

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  settings?: Record<string, any>;
  refreshInterval?: number;
  visible: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  columns: number;
  rowHeight: number;
  isDefault?: boolean;
}

export interface WidgetDefinition {
  type: WidgetType;
  name: string;
  description: string;
  defaultSize: WidgetSize;
  minSize: { w: number; h: number };
  maxSize: { w: number; h: number };
  configurable: boolean;
  refreshable: boolean;
  icon: string;
}

export interface WidgetData<T = any> {
  loading: boolean;
  error: string | null;
  data: T | null;
  lastUpdated: Date | null;
}
