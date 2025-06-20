export interface FullDashboardStatsDto {
  totalUsers: number;
  adminUsers: number;
  totalRooms: number;
  totalUps: number;
  totalServers: number;
  totalVms: number;
  serversUp: number;
  serversDown: number;
  vmsUp: number;
  vmsDown: number;
  setupComplete: boolean;
  setupProgress: number;
  onlineUsers: number;
}

export interface ServerCreationStat {
  month: string;
  count: number;
}

export interface UPSLoadStat {
  hour: string;
  load: number;
}
