import type { IloConfig } from '../ilos/types';

export type ServerState = 'UP' | 'DOWN';
export type ServerType = 'vcenter' | 'esxi';

export interface Server {
  id: string;
  name: string;
  ip: string;
  state: ServerState;
  adminUrl: string;
  login: string;
  password?: string;
  type: ServerType;
  priority: number;
  roomId: string;
  groupId: string;
  upsId?: string | null;
  ilo?: IloConfig | null;
  iloId?: string;
  vmwareHostMoid?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServerPayload {
  name: string;
  ip: string;
  state: ServerState;
  adminUrl: string;
  login: string;
  password: string;
  type: ServerType;
  priority: number;
  roomId: string;
  groupId?: string;
  upsId?: string;
  ilo: IloConfig;
}

export interface ServerListResponse {
  items: Server[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface ServerListParams {
  page?: number;
  limit?: number;
}
