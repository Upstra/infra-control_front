export enum SetupStep {
  WELCOME = "welcome",
  CREATE_ROOM = "create-room",
  CREATE_UPS = "create-ups",
  CREATE_SERVER = "create-server",
  VM_DISCOVERY = "vm-discovery",
  COMPLETE = "complete",
}

export interface SetupStatus {
  isFirstSetup: boolean;
  hasAdminUser: boolean;
  hasRooms: boolean;
  hasUps: boolean;
  hasServers: boolean;
  currentStep: SetupStep;
  isCurrentUserAdmin?: boolean;
  totalSteps: number;
  currentStepIndex: number;
}

export interface RoomCreationDto {
  name: string;
  location: string;
  capacity: number;
  coolingType: "air" | "liquid" | "free" | "hybrid";
}

export interface UpsCreationDto {
  name: string;
  brand: string;
  model: string;
  capacity: number;
  roomId: string;
}

export interface ServerCreationDto {
  name: string;
  state: string;
  grace_period_on: number;
  grace_period_off: number;
  adminUrl: string;
  ip: string;
  login: string;
  password: string;
  type: string;
  priority: number;
  roomId: string;
  groupId?: string;
  upsId?: string;
}
export interface SetupState {
  status: SetupStatus | null;
  currentStep: SetupStep;
  isLoading: boolean;
  error: string | null;
}

export const SETUP_STEP_ORDER: SetupStep[] = [
  SetupStep.WELCOME,
  SetupStep.CREATE_ROOM,
  SetupStep.CREATE_UPS,
  SetupStep.CREATE_SERVER,
  SetupStep.COMPLETE,
];
