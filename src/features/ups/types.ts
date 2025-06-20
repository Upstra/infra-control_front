export enum UpsState {
  Active = "active",
  Inactive = "inactive",
}
export interface Ups {
  id: string;
  name: string;
  ip: string;
  grace_period_on: number;
  grace_period_off: number;
  roomId: string;
  state: UpsState;
}

export interface UpsCreationDto {
  name: string;
  ip: string;
  login: string;
  password: string;
  grace_period_on: number;
  grace_period_off: number;
  roomId: string; // UUID
}

export interface UpsUpdateDto {
  name?: string;
  ip?: string;
  login?: string;
  password?: string;
  grace_period_on?: number;
  grace_period_off?: number;
  roomId?: string; // UUID
}

export interface UpsResponseDto {
  id: string; // UUID
  name: string;
  ip: string;
  grace_period_on: number;
  grace_period_off: number;
  roomId: string; // UUID
}
