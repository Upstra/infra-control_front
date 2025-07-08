export interface AdminSettings {
  registrationEnabled: boolean;
  requireEmailVerification: boolean;
  defaultUserRole: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowGuestAccess: boolean;
  maxUploadSize: number;
  allowedFileTypes: string[];
  enableApiAccess: boolean;
  apiRateLimit: number;
  enableWebSockets: boolean;
  enableEmailNotifications: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpSecure?: boolean;
  emailFrom?: string;
  enableBackups: boolean;
  backupInterval: number;
  backupRetention: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logRetention: number;
  enableMetrics: boolean;
  metricsRetention: number;
}

export interface SecuritySettings {
  registrationEnabled: boolean;
  requireEmailVerification: boolean;
  defaultUserRole: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  allowGuestAccess: boolean;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maxUploadSize: number;
  allowedFileTypes: string[];
  enableApiAccess: boolean;
  apiRateLimit: number;
  enableWebSockets: boolean;
}

export interface EmailSettings {
  enableEmailNotifications: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpSecure?: boolean;
  emailFrom?: string;
}

export interface BackupSettings {
  enableBackups: boolean;
  backupInterval: number;
  backupRetention: number;
}

export interface LoggingSettings {
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logRetention: number;
  enableMetrics: boolean;
  metricsRetention: number;
}
