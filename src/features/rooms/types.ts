export interface Room {
  id: string;
  name: string;
  serverCount?: number;
  upsCount?: number;
}

export interface RoomCreationDto {
  name: string;
}

export interface RoomResponseDto {
  id: string;
  name: string;
  servers?: Array<{
    id: string;
    name: string;
    state: string;
    grace_period_on: number;
    grace_period_off: number;
    ip: string;
    type: string;
    priority: number;
    roomId: string;
    upsId: string;
    ilo?: {
      id: string;
      name: string;
      ip: string;
    };
  }>;
  ups?: Array<{
    id: string;
    name: string;
    ip: string;
    grace_period_on: number;
    grace_period_off: number;
    roomId: string;
  }>;
  serverCount?: number;
  upsCount?: number;
}

export interface RoomListResponse {
  items: RoomResponseDto[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}
