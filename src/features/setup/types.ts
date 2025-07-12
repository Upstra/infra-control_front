export enum SetupStep {
  WELCOME = 'welcome',
  RESOURCE_PLANNING = 'planning',
  ROOMS_CONFIG = 'rooms',
  UPS_CONFIG = 'ups',
  SERVERS_CONFIG = 'servers',
  RELATIONSHIPS = 'relationships',
  REVIEW = 'review',
  COMPLETE = 'complete',
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

export interface RoomCreationDto {
  name: string;
}

export interface UpsCreationDto {
  name: string;
  ip?: string;
  roomId?: string;
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

export interface ImprovedSetupData {
  rooms: RoomCreationDto[];
  upsList: UpsCreationDto[];
  servers: ServerCreationDto[];
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
  rooms: Array<{
    name: string;
  }>;
  servers: Array<{
    name: string;
    ip: string;
    roomName: string;
    upsName?: string;
  }>;
}

export interface SetupTemplate {
  name: string;
  description: string;
  configuration: {
    roomDefaults?: Partial<RoomCreationDto>;
    serverDefaults?: Partial<ServerCreationDto>;
    upsDefaults?: Partial<UpsCreationDto>;
    quickSetups: Array<{
      name: string;
      rooms: number;
      serversPerRoom: number;
      upsPerRoom: number;
    }>;
  };
}
