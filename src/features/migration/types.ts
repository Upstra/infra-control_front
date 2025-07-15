export type MigrationState =
  | 'idle'
  | 'in migration'
  | 'migrated'
  | 'restarting'
  | 'failed';

export type MigrationEventType =
  | 'vm_migration'
  | 'vm_shutdown'
  | 'server_shutdown';

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

  // For vm_migration
  vmName?: string;
  vmMoid?: string;
  sourceMoid?: string;
  destinationMoid?: string;

  // For vm_shutdown
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
