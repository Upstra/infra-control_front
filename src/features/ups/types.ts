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
}

export interface UpsCreationDto {
  name: string;
  ip: string;
  roomId: string; // UUID
  grace_period_on: number;
  grace_period_off: number;
}

export interface UpsUpdateDto {
  name?: string;
  ip?: string;
  roomId?: string; // UUID
  grace_period_on?: number;
  grace_period_off?: number;
}

export interface UpsResponseDto {
  id: string; // UUID
  name: string;
  ip: string;
  roomId: string; // UUID
  serverCount: number;
  grace_period_on: number;
  grace_period_off: number;
  servers?: ConnectedServer[];
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
