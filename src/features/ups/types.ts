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

