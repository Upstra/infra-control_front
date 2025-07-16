export type MigrationState =
  | 'idle'
  | 'grace_shutdown'
  | 'shutting_down'
  | 'in_migration'
  | 'migrated'
  | 'restarting'
  | 'failed';

export type MigrationEventType =
  | 'vm_migration'
  | 'vm_shutdown'
  | 'vm_started'
  | 'server_shutdown'
  | 'grace_period'
  | 'start_shutdown'
  | 'finish_shutdown';

export interface MigrationDestination {
  sourceServerId: string;
  destinationServerId?: string;
}

export interface MigrationDestinationResponse {
  sourceServer: {
    id: string;
    name: string;
    vmwareHostMoid: string;
  };
  destinationServer?: {
    id: string;
    name: string;
    vmwareHostMoid: string;
  };
}

export interface MigrationEvent {
  type: MigrationEventType;
  timestamp: string;
  success: boolean;
  error?: string;
  message?: string;

  // For vm_migration
  vmName?: string;
  vmMoid?: string;
  sourceMoid?: string;
  destinationMoid?: string;

  // For vm_shutdown and vm_started
  // Uses vmName and vmMoid

  // For server_shutdown
  serverMoid?: string;
  serverName?: string;
}

export interface MigrationStatus {
  state: MigrationState;
  events: MigrationEvent[];
  currentOperation?: string;
  startTime?: string;
  endTime?: string;
  error?: string;
}

export interface DestinationsListResponse {
  destinations: MigrationDestinationResponse[];
  yamlPath: string;
}

export interface DestinationsConfigRequest {
  destinations: MigrationDestination[];
}

export interface MigrationStartRequest {
  planPath?: string;
}

export interface MigrationResponse {
  message: string;
  yamlPath?: string;
  sourceServerId?: string;
  success?: boolean;
}

export interface MigrationConfigUpdatedEvent {
  yamlPath: string;
  trigger: string;
}

export interface MigrationErrorEvent {
  message: string;
}

export interface VmMigrationInfo {
  id: string;
  name: string;
  moid?: string;
  state: string;
  priority: number;
  grace_period_on: number;
  grace_period_off: number;
}

export interface ServerVms {
  server: {
    id: string;
    name: string;
    ip: string;
  };
  vms: VmMigrationInfo[];
}

export interface VmsForMigrationResponse {
  servers: ServerVms[];
  totalServers: number;
  totalVms: number;
}
