import { defineStore } from 'pinia';
import { preferencesApi } from './api';
import type { UserPreferences, UserPreferencesUpdateDto } from './types';
import { DEFAULT_USER_PREFERENCES } from './types';
import { useLocaleStore } from '@/store/locale';
import { useThemeStore } from '@/store/theme';
import { useToast } from 'vue-toast-notification';
import { i18n } from '@/i18n';

const PREFERENCES_STORAGE_KEY = 'user_preferences';
const PREFERENCES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface State {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
}

export const useUserPreferencesStore = defineStore('userPreferences', {
  state: (): State => ({
    preferences: null,
    loading: false,
    error: null,
    lastSync: null,
  }),

  getters: {
    isLoaded: (state) => state.preferences !== null,
    locale: (state) =>
      state.preferences?.locale ?? DEFAULT_USER_PREFERENCES.locale,
    theme: (state) =>
      state.preferences?.theme ?? DEFAULT_USER_PREFERENCES.theme,
    timezone: (state) =>
      state.preferences?.timezone ?? DEFAULT_USER_PREFERENCES.timezone,
    notifications: (state) =>
      state.preferences?.notifications ??
      DEFAULT_USER_PREFERENCES.notifications,
    display: (state) =>
      state.preferences?.display ?? DEFAULT_USER_PREFERENCES.display,
    integrations: (state) =>
      state.preferences?.integrations ?? DEFAULT_USER_PREFERENCES.integrations,
    performance: (state) =>
      state.preferences?.performance ?? DEFAULT_USER_PREFERENCES.performance,
  },

  actions: {
    loadFromCache(): boolean {
      try {
        const cached = localStorage.getItem(PREFERENCES_STORAGE_KEY);
        if (!cached) return false;

        const { preferences, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;

        // Si le cache est trop vieux, on le considère comme invalide
        if (age > PREFERENCES_CACHE_DURATION) {
          localStorage.removeItem(PREFERENCES_STORAGE_KEY);
          return false;
        }

        this.preferences = preferences;
        this.lastSync = new Date(timestamp);
        this.syncWithLocalStores(preferences);
        return true;
      } catch (error) {
        console.warn('Failed to load preferences from cache:', error);
        localStorage.removeItem(PREFERENCES_STORAGE_KEY);
        return false;
      }
    },

    saveToCache(preferences: UserPreferences) {
      try {
        localStorage.setItem(
          PREFERENCES_STORAGE_KEY,
          JSON.stringify({
            preferences,
            timestamp: Date.now(),
          }),
        );
      } catch (error) {
        console.warn('Failed to save preferences to cache:', error);
      }
    },

    clearCache() {
      localStorage.removeItem(PREFERENCES_STORAGE_KEY);
    },

    async fetchPreferences(forceRefresh = false) {
      // Si on a déjà des préférences en mémoire et qu'on ne force pas, on retourne
      if (this.preferences && !forceRefresh) return;

      // Essayer de charger depuis le cache d'abord
      if (!forceRefresh && this.loadFromCache()) {
        // On a chargé depuis le cache, mais on lance quand même une mise à jour en arrière-plan
        this.fetchInBackground();
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const preferences = await preferencesApi.getPreferences();
        this.preferences = preferences;
        this.lastSync = new Date();

        this.syncWithLocalStores(preferences);
        this.saveToCache(preferences);
      } catch (error: any) {
        this.error =
          error.response?.data?.message || 'Failed to fetch preferences';

        const localeStore = useLocaleStore();
        const themeStore = useThemeStore();

        this.preferences = {
          ...DEFAULT_USER_PREFERENCES,
          locale: localeStore.currentLocale,
          theme: themeStore.theme,
          id: '',
          userId: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as UserPreferences;
      } finally {
        this.loading = false;
      }
    },

    async fetchInBackground() {
      try {
        const preferences = await preferencesApi.getPreferences();
        this.preferences = preferences;
        this.lastSync = new Date();
        this.saveToCache(preferences);
      } catch (error) {
        // Silencieux en arrière-plan
        console.debug('Background preferences sync failed:', error);
      }
    },

    async updatePreferences(
      updates: UserPreferencesUpdateDto,
      options?: { silent?: boolean },
    ) {
      if (!this.preferences) return;

      const toast = useToast();
      const previousPreferences = { ...this.preferences };

      this.preferences = {
        ...this.preferences,
        ...updates,
        notifications: {
          ...this.preferences.notifications,
          ...(updates.notifications || {}),
        },
        display: {
          ...this.preferences.display,
          ...(updates.display || {}),
        },
        integrations: {
          ...this.preferences.integrations,
          ...(updates.integrations || {}),
        },
        performance: {
          ...this.preferences.performance,
          ...(updates.performance || {}),
        },
      };

      try {
        const updatedPreferences =
          await preferencesApi.updatePreferences(updates);
        this.preferences = updatedPreferences;
        this.lastSync = new Date();

        this.syncWithLocalStores(updatedPreferences);
        this.saveToCache(updatedPreferences);

        // Show toast only if not silent
        if (!options?.silent) {
          toast.success(i18n.global.t('settings.preferences_saved'));
        }
      } catch (error: any) {
        this.preferences = previousPreferences;
        this.error =
          error.response?.data?.message || 'Failed to update preferences';
        toast.error(i18n.global.t('settings.save_error'));
      }
    },

    async resetPreferences() {
      const toast = useToast();

      this.loading = true;
      this.error = null;

      try {
        const preferences = await preferencesApi.resetPreferences();
        this.preferences = preferences;
        this.lastSync = new Date();

        this.syncWithLocalStores(preferences);

        toast.success(i18n.global.t('settings.preferences_reset'));
      } catch (error: any) {
        this.error =
          error.response?.data?.message || 'Failed to reset preferences';
        toast.error(i18n.global.t('settings.reset_error'));
      } finally {
        this.loading = false;
      }
    },

    syncWithLocalStores(preferences: UserPreferences) {
      const localeStore = useLocaleStore();
      const themeStore = useThemeStore();

      if (preferences.locale !== localeStore.currentLocale) {
        localeStore.setLocale(preferences.locale);
      }

      if (preferences.theme !== themeStore.theme) {
        themeStore.setTheme(preferences.theme);
      }
    },

    async updateSinglePreference<K extends keyof UserPreferences>(
      key: K,
      value: UserPreferences[K],
      options?: { silent?: boolean },
    ) {
      await this.updatePreferences({ [key]: value }, options);
    },

    async updateNestedPreference<
      K extends keyof Pick<
        UserPreferences,
        'notifications' | 'display' | 'integrations' | 'performance'
      >,
      NK extends keyof UserPreferences[K],
    >(
      category: K,
      key: NK,
      value: UserPreferences[K][NK],
      options?: { silent?: boolean },
    ) {
      await this.updatePreferences(
        {
          [category]: {
            [key]: value,
          },
        },
        options,
      );
    },
  },
});
