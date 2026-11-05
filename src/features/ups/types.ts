export enum UpsState {
  Active = 'active',
  Inactive = 'inactive',
}
export interface Ups {
  id: string;
  name: string;
  ip: string;
  roomId: string;
  grace_period_on: number;
  grace_period_off: number;
  servers?: ConnectedServer[];
  batteryStatus?: BatteryStatus;
  nominalPowerW?: number | null;
  effectiveNominalPowerW?: number | null;
  nominalPowerSource?: NominalPowerSource | null;
}

export type AlertLevel = 'normal' | 'low' | 'warning' | 'critical';

export type TelemetrySource = 'nut' | 'snmp' | 'http';

export interface UpsTelemetry {
  source: TelemetrySource;
  collectedAt: string;
  device: {
    manufacturer: string | null;
    model: string | null;
    serial: string | null;
    firmware: string | null;
  };
  status: {
    raw: string | null;
    onBattery: boolean | null;
    lowBattery: boolean | null;
    charging: boolean | null;
    onBypass: boolean | null;
    overload: boolean | null;
    replaceBattery: boolean | null;
  };
  battery: {
    chargePercent: number | null;
    runtimeSeconds: number | null;
    voltage: number | null;
    temperatureC: number | null;
    lastTestResult: string | null;
    lastTestAt: string | null;
  };
  input: { voltage: number | null; frequencyHz: number | null };
  output: { voltage: number | null; frequencyHz: number | null };
  load: {
    percent: number | null;
    realPowerW: number | null;
    nominalRealPowerW: number | null;
  };
  temperatureC: number | null;
}

export interface BatteryStatus {
  upsId: string;
  ip: string;
  minutesRemaining: number | null;
  hoursRemaining: number | null;
  alertLevel: AlertLevel;
  statusLabel: string;
  timestamp: string;
  onBattery: boolean | null;
  batteryPercentage: number | null;
  loadPercent: number | null;
  telemetry: UpsTelemetry | null;
  onBatterySince?: string | null;
}

export interface BatteryStatusChangedEvent {
  upsId: string;
  upsName: string;
  previous: boolean | null;
  current: boolean;
  at: string;
  status: BatteryStatus;
}

export interface BatteryAlertEvent {
  upsId: string;
  upsName: string;
  previousAlertLevel: AlertLevel | null;
  status: Pick<
    BatteryStatus,
    'ip' | 'minutesRemaining' | 'alertLevel' | 'statusLabel' | 'timestamp'
  >;
}

export type NominalPowerSource = 'device' | 'manual';

export interface UpsCreationDto {
  name: string;
  ip: string;
  roomId: string;
  grace_period_on: number;
  grace_period_off: number;
  nominalPowerW?: number | null;
}

export interface UpsUpdateDto {
  name?: string;
  ip?: string;
  roomId?: string;
  grace_period_on?: number;
  grace_period_off?: number;
  nominalPowerW?: number | null;
  moveServers?: boolean;
}

export interface UpsResponseDto {
  id: string;
  name: string;
  ip: string;
  roomId: string;
  serverCount: number;
  grace_period_on: number;
  grace_period_off: number;
  servers?: ConnectedServer[];
  batteryStatus?: BatteryStatus;
  nominalPowerW: number | null;
  effectiveNominalPowerW: number | null;
  nominalPowerSource: NominalPowerSource | null;
  movedServerIds?: string[];
}

export interface ConnectedServer {
  id: string;
  name: string;
  ip: string;
  state: 'UP' | 'DOWN';
  type: 'vcenter' | 'esxi';
  powerConsumption?: number;
}

export interface UpsListResponse {
  items: UpsResponseDto[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export type UPSBatteryStatusDto = BatteryStatus;
