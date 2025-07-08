import api from '@/services/api';
import type { AdminSettings } from '../types/settings';

export const adminSettingsApi = {
  async getSettings(): Promise<AdminSettings> {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  async updateSettings(
    settings: Partial<AdminSettings>,
  ): Promise<AdminSettings> {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  },

  async testSmtpConnection(config: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/admin/settings/test-smtp', config);
    return response.data;
  },

  async triggerBackup(): Promise<{ success: boolean; backupId: string }> {
    const response = await api.post('/admin/settings/backup/trigger');
    return response.data;
  },

  async getBackups(): Promise<
    Array<{
      id: string;
      createdAt: string;
      size: number;
      type: 'manual' | 'automatic';
    }>
  > {
    const response = await api.get('/admin/settings/backups');
    return response.data;
  },

  async restoreBackup(backupId: string): Promise<{ success: boolean }> {
    const response = await api.post(
      `/admin/settings/backup/restore/${backupId}`,
    );
    return response.data;
  },
};
