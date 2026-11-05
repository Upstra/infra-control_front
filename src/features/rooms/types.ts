export interface RoomThresholds {
  inletWarnC?: number | null;
  inletCritC?: number | null;
}

export interface Room extends RoomThresholds {
  id: string;
  name: string;
  serverCount?: number;
  upsCount?: number;
}

export interface RoomCreationDto extends RoomThresholds {
  name: string;
}

export interface RoomEnvironment {
  maxInletC: number | null;
  maxInletServerId: string | null;
  totalConsumedW: number | null;
  serversWithIlo: number;
  serversReporting: number;
}

export interface RoomResponseDto extends RoomThresholds {
  id: string;
  name: string;
  servers?: Array<{
    id: string;
    name: string;
    state: string;
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

export interface VmTreeDto {
  id: string;
  name: string;
}

export interface ServerTreeDto {
  id: string;
  name: string;
  vms: VmTreeDto[];
}

export interface UpsTreeDto {
  id: string;
  name: string;
}

export interface RoomTreeDto {
  id: string;
  name: string;
  servers: ServerTreeDto[];
  ups: UpsTreeDto[];
}

export interface RoomTreeListResponseDto {
  rooms: RoomTreeDto[];
  total: number;
  page: number;
  limit: number;
}
