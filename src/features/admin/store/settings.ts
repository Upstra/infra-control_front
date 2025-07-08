import { defineStore } from 'pinia';
import { ref } from 'vue';
import { adminSettingsApi } from '../api/settings';
import type { AdminSettings } from '../types/settings';
import { useToast } from 'vue-toast-notification';

export const useAdminSettingsStore = defineStore('adminSettings', () => {
  const settings = ref<AdminSettings | null>(null);
  const isLoading = ref(false);
  const toast = useToast();

  const fetchSettings = async () => {
    try {
      isLoading.value = true;
      settings.value = await adminSettingsApi.getSettings();
    } catch (error) {
      console.error('Failed to fetch admin settings:', error);
      toast.error('Failed to load admin settings');
    } finally {
      isLoading.value = false;
    }
  };

  const updateSettings = async (updates: Partial<AdminSettings>) => {
    try {
      isLoading.value = true;
      settings.value = await adminSettingsApi.updateSettings(updates);
      toast.success('Settings updated successfully');
      return true;
    } catch (error) {
      console.error('Failed to update admin settings:', error);
      toast.error('Failed to update settings');
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const testSmtpConnection = async (config: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  }) => {
    try {
      const result = await adminSettingsApi.testSmtpConnection(config);
      if (result.success) {
        toast.success(result.message || 'SMTP connection successful');
      } else {
        toast.error(result.message || 'SMTP connection failed');
      }
      return result.success;
    } catch (error) {
      console.error('Failed to test SMTP connection:', error);
      toast.error('Failed to test SMTP connection');
      return false;
    }
  };

  const triggerBackup = async () => {
    try {
      const result = await adminSettingsApi.triggerBackup();
      if (result.success) {
        toast.success('Backup triggered successfully');
      }
      return result;
    } catch (error) {
      console.error('Failed to trigger backup:', error);
      toast.error('Failed to trigger backup');
      return { success: false, backupId: '' };
    }
  };

  return {
    settings,
    isLoading,
    fetchSettings,
    updateSettings,
    testSmtpConnection,
    triggerBackup,
  };
});
