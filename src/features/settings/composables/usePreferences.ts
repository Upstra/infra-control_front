import { computed } from 'vue';
import { useUserPreferencesStore } from '../store';
import type { UserPreferences } from '../types';

export function usePreferences() {
  const store = useUserPreferencesStore();

  const preferences = computed(() => store.preferences);
  const isLoading = computed(() => store.loading);
  const error = computed(() => store.error);

  const updatePreference = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => {
    await store.updateSinglePreference(key, value);
  };

  const updateNestedPreference = async <
    K extends keyof Pick<
      UserPreferences,
      'notifications' | 'display' | 'integrations' | 'performance'
    >,
    NK extends keyof UserPreferences[K],
  >(
    category: K,
    key: NK,
    value: UserPreferences[K][NK],
  ) => {
    await store.updateNestedPreference(category, key, value);
  };

  const resetPreferences = async () => {
    await store.resetPreferences();
  };

  const refreshPreferences = async () => {
    await store.fetchPreferences();
  };

  return {
    preferences,
    isLoading,
    error,
    locale: computed(() => store.locale),
    theme: computed(() => store.theme),
    timezone: computed(() => store.timezone),
    notifications: computed(() => store.notifications),
    display: computed(() => store.display),
    integrations: computed(() => store.integrations),
    performance: computed(() => store.performance),
    updatePreference,
    updateNestedPreference,
    resetPreferences,
    refreshPreferences,
  };
}
