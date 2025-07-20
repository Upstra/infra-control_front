export enum UpsState {
  Active = 'active',
  Inactive = 'inactive',
}
export interface Ups {
  id: string;
  name: string;
  ip: string;
  roomId: string;
  grace_period_on: number;
  grace_period_off: number;
  servers?: ConnectedServer[];
  batteryStatus?: BatteryStatus;
}

export interface BatteryStatus {
  upsId: string;
  ip: string;
  minutesRemaining: number;
  hoursRemaining: number;
  alertLevel: 'normal' | 'low' | 'warning' | 'critical';
  statusLabel: string;
  timestamp: Date | string;
  batteryPercentage?: number;
  load?: number;
}

export interface UpsCreationDto {
  name: string;
  ip: string;
  roomId: string;
  grace_period_on: number;
  grace_period_off: number;
}

export interface UpsUpdateDto {
  name?: string;
  ip?: string;
  roomId?: string;
  grace_period_on?: number;
  grace_period_off?: number;
}

export interface UpsResponseDto {
  id: string;
  name: string;
  ip: string;
  roomId: string;
  serverCount: number;
  grace_period_on: number;
  grace_period_off: number;
  servers?: ConnectedServer[];
  batteryStatus?: BatteryStatus;
}

export interface ConnectedServer {
  id: string;
  name: string;
  ip: string;
  state: 'UP' | 'DOWN';
  type: 'vcenter' | 'esxi';
  powerConsumption?: number;
}

export interface UpsListResponse {
  items: UpsResponseDto[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface UPSBatteryStatusDto {
  upsId: string;
  ip: string;
  minutesRemaining: number;
  hoursRemaining: number;
  alertLevel: 'normal' | 'low' | 'warning' | 'critical';
  statusLabel: string;
  timestamp: Date;
}
