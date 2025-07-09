import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserPreferencesStore } from '../store';
import { preferencesApi } from '../api';
import { useLocaleStore } from '@/store/locale';
import { useThemeStore } from '@/store/theme';
import type { UserPreferences, UserPreferencesUpdateDto } from '../types';

vi.mock('../api');
vi.mock('vue-toast-notification', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
  createI18n: vi.fn(() => ({
    global: {
      locale: { value: 'fr' },
      t: (key: string) => key,
    },
  })),
}));

const mockPreferences: UserPreferences = {
  id: '1',
  userId: 'user1',
  locale: 'en',
  theme: 'light',
  timezone: 'Europe/Paris',
  notifications: {
    server: false,
    ups: true,
    email: false,
    push: true,
  },
  display: {
    defaultUserView: 'card',
    defaultServerView: 'list',
    defaultUpsView: 'grid',
    defaultRoomView: 'grid',
    defaultGroupView: 'grid',
    compactMode: true,
  },
  integrations: {
    slackWebhook: 'https://slack.com/webhook',
    alertEmail: 'alert@example.com',
  },
  performance: {
    autoRefresh: false,
    refreshInterval: 120,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('UserPreferencesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    // Mock window.matchMedia for theme store
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('initializes with default state', () => {
    const store = useUserPreferencesStore();
    expect(store.preferences).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.isLoaded).toBe(false);
  });

  describe('fetchPreferences', () => {
    it('fetches preferences successfully', async () => {
      vi.mocked(preferencesApi.getPreferences).mockResolvedValue(
        mockPreferences,
      );

      const store = useUserPreferencesStore();
      await store.fetchPreferences();

      expect(store.preferences).toBeTruthy();
      expect(store.isLoaded).toBe(true);
      expect(store.lastSync).toBeInstanceOf(Date);
      expect(preferencesApi.getPreferences).toHaveBeenCalled();
    });

    it('handles fetch error and uses fallback', async () => {
      vi.mocked(preferencesApi.getPreferences).mockRejectedValue(
        new Error('Network error'),
      );

      const localeStore = useLocaleStore();
      const themeStore = useThemeStore();
      localeStore.currentLocale = 'fr';
      themeStore.theme = 'dark';

      const store = useUserPreferencesStore();
      await store.fetchPreferences();

      expect(store.preferences).toBeTruthy();
      expect(store.preferences?.locale).toBe('fr');
      expect(store.preferences?.theme).toBe('dark');
    });

    it('syncs with locale and theme stores', async () => {
      const mockPrefsWithDifferentLocaleTheme = {
        ...mockPreferences,
        locale: 'en' as const,
        theme: 'light' as const,
      };

      vi.mocked(preferencesApi.getPreferences).mockResolvedValue(
        mockPrefsWithDifferentLocaleTheme,
      );

      const store = useUserPreferencesStore();
      await store.fetchPreferences();

      // Verify that sync was called
      expect(store.preferences?.locale).toBe('en');
      expect(store.preferences?.theme).toBe('light');
    });
  });

  describe('updatePreferences', () => {
    it('updates preferences successfully', async () => {
      const updates = { timezone: 'America/New_York' };
      const updatedPreferences = { ...mockPreferences, ...updates };

      vi.mocked(preferencesApi.updatePreferences).mockResolvedValue(
        updatedPreferences,
      );

      const store = useUserPreferencesStore();
      store.preferences = mockPreferences;

      await store.updatePreferences(updates);

      expect(preferencesApi.updatePreferences).toHaveBeenCalledWith(updates);
      expect(store.preferences).toEqual(updatedPreferences);
    });

    it('handles nested updates correctly', async () => {
      const updates: UserPreferencesUpdateDto = {
        notifications: {
          server: false,
          ups: true,
          email: true,
          push: true,
        },
        display: {
          defaultUserView: 'card',
          defaultServerView: 'list',
          defaultUpsView: 'grid',
          defaultRoomView: 'grid',
          defaultGroupView: 'grid',
          compactMode: false,
        },
      };

      const updatedPreferences = {
        ...mockPreferences,
        notifications: updates.notifications!,
        display: updates.display!,
      };

      vi.mocked(preferencesApi.updatePreferences).mockResolvedValue(
        updatedPreferences,
      );

      const store = useUserPreferencesStore();
      store.preferences = mockPreferences;

      await store.updatePreferences(updates);

      expect(preferencesApi.updatePreferences).toHaveBeenCalledWith(updates);
      expect(store.preferences).toEqual(updatedPreferences);
    });

    it('reverts on update error', async () => {
      vi.mocked(preferencesApi.updatePreferences).mockRejectedValue(
        new Error('Update failed'),
      );

      const store = useUserPreferencesStore();
      store.preferences = mockPreferences;

      await store.updatePreferences({ timezone: 'Invalid/Timezone' });

      expect(store.preferences).toEqual(mockPreferences);
      expect(store.error).toBeTruthy();
    });
  });

  describe('resetPreferences', () => {
    it('resets preferences successfully', async () => {
      const defaultPreferences: UserPreferences = {
        ...mockPreferences,
        locale: 'fr',
        theme: 'dark',
      };

      vi.mocked(preferencesApi.resetPreferences).mockResolvedValue(
        defaultPreferences,
      );

      const store = useUserPreferencesStore();
      await store.resetPreferences();

      expect(store.preferences).toEqual(defaultPreferences);
      expect(store.loading).toBe(false);
    });
  });

  describe('helper methods', () => {
    it('updateSinglePreference updates a single preference', async () => {
      const store = useUserPreferencesStore();
      store.updatePreferences = vi.fn();

      await store.updateSinglePreference('timezone', 'UTC');

      expect(store.updatePreferences).toHaveBeenCalledWith({ timezone: 'UTC' });
    });

    it('updateNestedPreference updates nested preferences', async () => {
      const store = useUserPreferencesStore();
      store.updatePreferences = vi.fn();

      await store.updateNestedPreference('notifications', 'server', false);

      expect(store.updatePreferences).toHaveBeenCalledWith({
        notifications: { server: false },
      });
    });
  });

  describe('getters', () => {
    it('returns default values when preferences are null', () => {
      const store = useUserPreferencesStore();

      expect(store.locale).toBe('fr');
      expect(store.theme).toBe('dark');
      expect(store.timezone).toBe('UTC');
      expect(store.notifications.server).toBe(true);
      expect(store.display.defaultUserView).toBe('table');
    });

    it('returns preference values when loaded', () => {
      const store = useUserPreferencesStore();
      store.preferences = mockPreferences;

      expect(store.locale).toBe('en');
      expect(store.theme).toBe('light');
      expect(store.timezone).toBe('Europe/Paris');
      expect(store.notifications.server).toBe(false);
      expect(store.display.defaultUserView).toBe('card');
    });
  });
});
