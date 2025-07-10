import { defineStore } from 'pinia';
import { systemSettingsApi } from './api';
import type {
  SystemSettingsData,
  UpdateSystemSettingsDto,
  ImportSettingsDto,
  SettingsCategory,
} from './types';

interface SystemSettingsState {
  settings: SystemSettingsData | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
  unsavedChanges: boolean;
}

export const useSystemSettingsStore = defineStore('systemSettings', {
  state: (): SystemSettingsState => ({
    settings: null,
    loading: false,
    error: null,
    lastFetch: null,
    unsavedChanges: false,
  }),

  getters: {
    isMaintenanceMode: (state) =>
      state.settings?.system.maintenanceMode ?? false,
    maintenanceMessage: (state) =>
      state.settings?.system.maintenanceMessage ?? '',
    isRegistrationEnabled: (state) =>
      state.settings?.security.registrationEnabled ?? true,
    emailEnabled: (state) => state.settings?.email.enabled ?? false,
    backupEnabled: (state) => state.settings?.backup.enabled ?? false,
    logLevel: (state) => state.settings?.logging.level ?? 'info',
    passwordPolicy: (state) => state.settings?.security.passwordPolicy,
    sessionTimeout: (state) => state.settings?.security.sessionTimeout ?? 3600,
    maxLoginAttempts: (state) => state.settings?.security.maxLoginAttempts ?? 5,
  },

  actions: {
    async fetchSettings(force = false) {
      if (
        !force &&
        this.lastFetch &&
        Date.now() - this.lastFetch.getTime() < 60000
      ) {
        return this.settings;
      }

      this.loading = true;
      this.error = null;
      try {
        const response = await systemSettingsApi.getSettings();
        this.settings = response.data;
        this.lastFetch = new Date();
        this.unsavedChanges = false;
        return this.settings;
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateSettings(updates: UpdateSystemSettingsDto) {
      this.loading = true;
      this.error = null;
      try {
        const response = await systemSettingsApi.updateSettings(updates);
        this.settings = response.data;
        this.lastFetch = new Date();
        this.unsavedChanges = false;
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async resetCategory(category: SettingsCategory) {
      this.loading = true;
      this.error = null;
      try {
        const response = await systemSettingsApi.resetCategory(category);
        this.settings = response.data;
        this.lastFetch = new Date();
        this.unsavedChanges = false;
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async testEmail(to: string) {
      try {
        await systemSettingsApi.testEmail(to);
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message;
        throw error;
      }
    },

    async exportSettings() {
      try {
        const response = await systemSettingsApi.exportSettings();
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message;
        throw error;
      }
    },

    async importSettings(data: ImportSettingsDto) {
      this.loading = true;
      this.error = null;
      try {
        const response = await systemSettingsApi.importSettings(data);
        this.settings = response.data;
        this.lastFetch = new Date();
        this.unsavedChanges = false;
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setUnsavedChanges(value: boolean) {
      this.unsavedChanges = value;
    },

    clearError() {
      this.error = null;
    },
  },
});
