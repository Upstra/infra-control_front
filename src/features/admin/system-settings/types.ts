export interface SystemSettingsData {
  security: SecuritySettings;
  system: SystemConfig;
  email: EmailSettings;
  backup: BackupSettings;
  logging: LoggingSettings;
}

export interface SecuritySettings {
  registrationEnabled: boolean;
  requireEmailVerification: boolean;
  defaultUserRole: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  allowGuestAccess: boolean;
}

export interface SystemConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maxUploadSize: number;
  allowedFileTypes: string[];
  api: {
    enabled: boolean;
    rateLimit: number;
  };
  enableWebSockets: boolean;
}

export interface EmailSettings {
  enabled: boolean;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password?: string;
  };
  from: {
    name: string;
    address: string;
  };
}

export interface BackupSettings {
  enabled: boolean;
  schedule: {
    interval: number;
    retention: number;
  };
  storage: {
    type: 'local' | 's3' | 'azure';
    path?: string;
    credentials?: Record<string, string>;
  };
}

export interface LoggingSettings {
  level: 'debug' | 'info' | 'warn' | 'error';
  retention: number;
  metrics: {
    enabled: boolean;
    retention: number;
  };
}

export interface UpdateSystemSettingsDto {
  security?: Partial<SecuritySettings>;
  system?: Partial<SystemConfig>;
  email?: Partial<EmailSettings>;
  backup?: Partial<BackupSettings>;
  logging?: Partial<LoggingSettings>;
}

export interface ImportSettingsDto {
  version: string;
  exportedAt: Date;
  settings: SystemSettingsData;
}

export interface ExportSettingsResponseDto {
  version: string;
  exportedAt: Date;
  settings: SystemSettingsData;
}

export type SystemSettingsResponseDto = SystemSettingsData;

export type SettingsCategory =
  | 'security'
  | 'system'
  | 'email'
  | 'backup'
  | 'logging';
