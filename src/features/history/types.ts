export enum HistoryEntity {
  User = 'user',
  Role = 'role',
  Server = 'server',
  Room = 'room',
  Ups = 'ups',
}

export enum HistoryAction {
  Create = 'CREATE',
  Update = 'UPDATE',
  Delete = 'DELETE',
}

export interface HistoryEvent {
  id: string;
  entity: HistoryEntity | string;
  entityId: string;
  action: HistoryAction | string;
  userId?: string;
  createdAt: string;
}

export interface HistoryListResponseDto {
  items: HistoryEvent[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface HistoryFilter {
  entity?: HistoryEntity | '';
  action?: HistoryAction | '';
  userId?: string;
  from?: string;
  to?: string;
}

export const entityToPath: Record<string, string> = {
  user: 'users',
  server: 'servers',
  room: 'rooms',
  ups: 'ups',
  vm: 'vms',
  role: 'roles',
  group: 'groups',
};
