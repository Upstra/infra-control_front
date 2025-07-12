export enum UpsState {
  Active = 'active',
  Inactive = 'inactive',
}
export interface Ups {
  id: string;
  name: string;
  ip: string;
  roomId: string;
}

export interface UpsCreationDto {
  name: string;
  ip: string;
  roomId: string; // UUID
}

export interface UpsUpdateDto {
  name?: string;
  ip?: string;
  roomId?: string; // UUID
}

export interface UpsResponseDto {
  id: string; // UUID
  name: string;
  ip: string;
  roomId: string; // UUID
  serverCount: number;
}

export interface UpsListResponse {
  items: UpsResponseDto[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}
