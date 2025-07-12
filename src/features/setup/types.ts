export enum SetupStep {
  WELCOME = 'welcome',
  RESOURCE_PLANNING = 'planning',
  ROOMS_CONFIG = 'rooms',
  UPS_CONFIG = 'ups',
  SERVERS_CONFIG = 'servers',
  RELATIONSHIPS = 'relationships',
  REVIEW = 'review',
  COMPLETE = 'complete',

  // @deprecated - Use new bulk workflow instead
  CREATE_ROOM = 'create-room',
  CREATE_UPS = 'create-ups',
  CREATE_SERVER = 'create-server',
  VM_DISCOVERY = 'vm-discovery',
}

export interface SetupStatus {
  isFirstSetup: boolean;
  hasAdminUser: boolean;
  hasRooms: boolean;
  hasUps: boolean;
  hasServers: boolean;
  currentStep: SetupStep;
  isCurrentUserAdmin?: boolean;
  totalSteps: number;
  currentStepIndex: number;
}

export interface BulkRoomDto {
  name: string;
  tempId?: string;
  id?: string;
  location?: string;
  capacity?: number;
  coolingType?: 'air' | 'liquid' | 'free' | 'hybrid';
}

export interface RoomCreationDto {
  name: string;
}

export interface BulkUpsDto {
  name: string;
  ip?: string;
  roomId?: string;
  tempId?: string;
  id?: string;
  status?: 'connected' | 'pending' | 'error';
}

export interface UpsCreationDto {
  name: string;
  ip?: string;
  roomId?: string;
  status?: string;
}

export interface BulkServerDto {
  name: string;
  state: string;
  grace_period_on: number;
  grace_period_off: number;
  adminUrl: string;
  ip: string;
  login: string;
  password: string;
  type: string;
  priority: number;
  roomId?: string;
  upsId?: string;
  groupId?: string;
  ilo_name?: string;
  ilo_ip?: string;
  ilo_login?: string;
  ilo_password?: string;
  tempId?: string;
  id?: string;
  status?: 'connected' | 'pending' | 'error';
}

export interface ServerCreationDto {
  name: string;
  state: string;
  grace_period_on: number;
  grace_period_off: number;
  adminUrl: string;
  ip: string;
  login: string;
  password: string;
  type: string;
  priority: number;
  roomId: string;
  groupId?: string;
  upsId?: string;
  ilo_name?: string;
  ilo_ip?: string;
  ilo_login?: string;
  ilo_password?: string;
}
export interface SetupState {
  status: SetupStatus | null;
  currentStep: SetupStep;
  isLoading: boolean;
  error: string | null;
}

export const SETUP_STEP_ORDER: SetupStep[] = [
  SetupStep.WELCOME,
  SetupStep.RESOURCE_PLANNING,
  SetupStep.ROOMS_CONFIG,
  SetupStep.UPS_CONFIG,
  SetupStep.SERVERS_CONFIG,
  SetupStep.RELATIONSHIPS,
  SetupStep.REVIEW,
  SetupStep.COMPLETE,
];

export interface BulkCreateRequest {
  rooms: BulkRoomDto[];
  upsList: BulkUpsDto[];
  servers: BulkServerDto[];
  idMapping?: {
    rooms: { [tempId: string]: string };
    ups: { [tempId: string]: string };
  };
}

export interface BulkCreateResponse {
  success: boolean;
  created: {
    rooms: Array<{ id: string; name: string; tempId?: string }>;
    upsList: Array<{ id: string; name: string; tempId?: string }>;
    servers: Array<{ id: string; name: string; tempId?: string }>;
  };
  errors?: Array<{
    resource: 'room' | 'ups' | 'server';
    name: string;
    error: string;
  }>;
  idMapping: {
    rooms: { [tempId: string]: string };
    ups: { [tempId: string]: string };
  };
}

export interface ValidationRequest {
  resources: {
    rooms: BulkRoomDto[];
    upsList: BulkUpsDto[];
    servers: BulkServerDto[];
  };
  checkConnectivity?: boolean;
}

export interface ValidationResponse {
  valid: boolean;
  errors: Array<{
    resource: 'room' | 'ups' | 'server';
    index: number;
    field: string;
    message: string;
  }>;
  warnings: Array<{
    resource: 'room' | 'ups' | 'server';
    index: number;
    message: string;
  }>;
  connectivityResults?: {
    ups: Array<{ index: number; ip: string; accessible: boolean }>;
    servers: Array<{
      index: number;
      ip: string;
      accessible: boolean;
      iloIp?: string;
      iloAccessible?: boolean;
    }>;
  };
}

export interface ImprovedSetupData {
  rooms: BulkRoomDto[];
  upsList: BulkUpsDto[];
  servers: BulkServerDto[];
  templates: {
    roomTemplates: RoomTemplate[];
    serverTemplates: ServerTemplate[];
  };
  bulkImport?: {
    format: 'csv' | 'json';
    data: any;
  };
}

export interface RoomTemplate {
  id?: string;
  name: string;
}

export interface ServerTemplate {
  id?: string;
  name: string;
  type: string;
  priority: number;
  grace_period_on: number;
  grace_period_off: number;
}

export interface BulkImportData {
  rooms?: Array<{
    name: string;
  }>;
  upsList?: Array<{
    name: string;
    ip?: string;
    brand?: string;
    model?: string;
    capacity?: number;
    roomId?: string;
  }>;
  servers?: Array<{
    name: string;
    ip?: string;
    type?: string;
    priority?: number;
    grace_period_on?: number;
    grace_period_off?: number;
    adminUrl?: string;
    login?: string;
    password?: string;
    roomId?: string;
    upsId?: string;
    ilo_name?: string;
    ilo_ip?: string;
    ilo_login?: string;
    ilo_password?: string;
  }>;
}

export interface SetupTemplate {
  id: string;
  name: string;
  description: string;
  type: 'predefined' | 'custom' | 'shared';
  configuration: {
    rooms: Array<Partial<BulkRoomDto>>;
    upsList: Array<Partial<BulkUpsDto>>;
    servers: Array<Partial<BulkServerDto>>;
  };
  createdAt: Date;
  createdBy?: string;
}

export interface EnhancedProgressResponse {
  currentStep: SetupStep;
  completedSteps: SetupStep[];
  totalSteps: number;
  percentComplete: number;
  resourceCounts: {
    rooms: number;
    ups: number;
    servers: number;
  };
  lastModified: Date;
  canSkipToReview: boolean;
  isCompleted: boolean;
}
