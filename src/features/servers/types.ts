import type { IloConfig } from '../ilos/types';

export type ServerState = 'active' | 'inactive';
export type ServerType = 'physical' | 'virtual';

export interface Server {
  id: string;
  name: string;
  ip: string;
  state: ServerState;
  adminUrl: string;
  login: string;
  type: ServerType;
  priority: number;
  grace_period_on: number;
  grace_period_off: number;
  roomId: string;
  groupId: string;
  upsId?: string;
  ilo: IloConfig;
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
  grace_period_on: number;
  grace_period_off: number;
  roomId: string;
  groupId?: string;
  upsId?: string;
  ilo: IloConfig;
}
