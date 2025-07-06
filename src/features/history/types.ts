export enum HistoryEntity {
  User = 'user',
  Role = 'role',
  UserRole = 'user_role',
  Server = 'server',
  Room = 'room',
  Ups = 'ups',
  Vm = 'vm',
  Auth = 'auth',
  Group = 'group',
}

export enum HistoryAction {
  Create = 'CREATE',
  Update = 'UPDATE',
  Delete = 'DELETE',
  LoginSuccess = 'LOGIN_SUCCESS',
  LoginFailed = 'LOGIN_FAILED',
  Login2FARequired = 'LOGIN_2FA_REQUIRED',
  RegisterSuccess = 'REGISTER_SUCCESS',
  UpdateRole = 'UPDATE_ROLE',
  Start = 'START',
  Restart = 'RESTART',
  Shutdown = 'SHUTDOWN',
}

export interface HistoryUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  active: boolean;
  roles?: Array<{
    id: string;
    name: string;
    isAdmin: boolean;
  }>;
}

export interface HistoryEvent {
  id: string;
  entity: HistoryEntity | string;
  entityId: string;
  action: HistoryAction | string;
  userId?: string;
  user?: HistoryUser;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HistoryListResponseDto {
  items: HistoryEvent[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface HistoryFilter {
  entity?: HistoryEntity | '';
  action?: HistoryAction | '';
  entities?: HistoryEntity[];
  actions?: HistoryAction[];
  userId?: string;
  entityId?: string;
  from?: string;
  to?: string;
}

export interface HistoryFilters extends HistoryFilter {}

export const entityToPath: Record<string, string> = {
  user: 'users',
  server: 'servers',
  room: 'rooms',
  ups: 'ups',
  vm: 'vms',
  role: 'roles',
  group: 'groups',
  user_role: 'users',
  auth: 'users',
};

export const actionStyles: Record<string, { color: string; icon: string }> = {
  CREATE: { color: 'text-green-600', icon: '➕' },
  UPDATE: { color: 'text-blue-600', icon: '✏️' },
  DELETE: { color: 'text-red-600', icon: '🗑️' },
  LOGIN_SUCCESS: { color: 'text-green-600', icon: '✅' },
  LOGIN_FAILED: { color: 'text-red-600', icon: '❌' },
  LOGIN_2FA_REQUIRED: { color: 'text-yellow-600', icon: '🔐' },
  REGISTER_SUCCESS: { color: 'text-green-600', icon: '👤' },
  UPDATE_ROLE: { color: 'text-purple-600', icon: '👑' },
  START: { color: 'text-green-600', icon: '▶️' },
  RESTART: { color: 'text-yellow-600', icon: '🔄' },
  SHUTDOWN: { color: 'text-orange-600', icon: '⏹️' },
};

export interface ActivityTrend {
  date: string;
  count: number;
}

export interface TopUser {
  userId: string;
  username: string;
  count: number;
}

export interface HistoryStatsResponse {
  totalEvents: number;
  eventsByEntity: Record<string, number>;
  eventsByAction: Record<string, number>;
  activityTrends: ActivityTrend[];
  topUsers: TopUser[];
}
