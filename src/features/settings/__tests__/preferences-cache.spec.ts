import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserPreferencesStore } from '../store';
import { preferencesApi } from '../api';
import type { UserPreferences } from '../types';

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
    defaultGroupView: 'flow',
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

describe('UserPreferences Cache Integration', () => {
  let originalLocalStorage: Storage;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    // Mock localStorage
    originalLocalStorage = window.localStorage;
    const localStorageMock: { [key: string]: string } = {};

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => localStorageMock[key] || null,
        setItem: (key: string, value: string) => {
          localStorageMock[key] = value;
        },
        removeItem: (key: string) => {
          delete localStorageMock[key];
        },
        clear: () => {
          Object.keys(localStorageMock).forEach(
            (key) => delete localStorageMock[key],
          );
        },
      },
      writable: true,
    });

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

  afterEach(() => {
    window.localStorage = originalLocalStorage;
  });

  describe('Cache Loading', () => {
    it('loads preferences from cache when valid', async () => {
      const cachedData = {
        preferences: mockPreferences,
        timestamp: Date.now() - 60000, // 1 minute ago
      };
      localStorage.setItem('user_preferences', JSON.stringify(cachedData));

      const store = useUserPreferencesStore();
      const loadedFromCache = store.loadFromCache();

      expect(loadedFromCache).toBe(true);
      expect(store.preferences).toEqual(mockPreferences);
      expect(store.lastSync).toBeInstanceOf(Date);
    });

    it('ignores expired cache', async () => {
      const cachedData = {
        preferences: mockPreferences,
        timestamp: Date.now() - 6 * 60 * 1000, // 6 minutes ago (expired)
      };
      localStorage.setItem('user_preferences', JSON.stringify(cachedData));

      const store = useUserPreferencesStore();
      const loadedFromCache = store.loadFromCache();

      expect(loadedFromCache).toBe(false);
      expect(store.preferences).toBeNull();
      expect(localStorage.getItem('user_preferences')).toBeNull();
    });

    it('handles invalid cache data gracefully', async () => {
      localStorage.setItem('user_preferences', 'invalid json');

      const store = useUserPreferencesStore();
      const loadedFromCache = store.loadFromCache();

      expect(loadedFromCache).toBe(false);
      expect(store.preferences).toBeNull();
      expect(localStorage.getItem('user_preferences')).toBeNull();
    });
  });

  describe('Cache Saving', () => {
    it('saves preferences to cache with timestamp', async () => {
      const store = useUserPreferencesStore();
      store.saveToCache(mockPreferences);

      const cached = localStorage.getItem('user_preferences');
      expect(cached).toBeTruthy();

      const parsedCache = JSON.parse(cached!);
      expect(parsedCache.preferences).toEqual(mockPreferences);
      expect(parsedCache.timestamp).toBeGreaterThan(Date.now() - 1000);
    });

    it('handles localStorage errors gracefully', async () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      // Mock localStorage.setItem to throw an error
      vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const store = useUserPreferencesStore();
      store.saveToCache(mockPreferences);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to save preferences to cache:',
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Cache Clear', () => {
    it('removes preferences from localStorage', async () => {
      localStorage.setItem(
        'user_preferences',
        JSON.stringify({
          preferences: mockPreferences,
          timestamp: Date.now(),
        }),
      );

      const store = useUserPreferencesStore();
      store.clearCache();

      expect(localStorage.getItem('user_preferences')).toBeNull();
    });
  });

  describe('Fetch with Cache', () => {
    it('uses cache and triggers background sync when cache is valid', async () => {
      const cachedData = {
        preferences: mockPreferences,
        timestamp: Date.now() - 60000, // 1 minute ago
      };
      localStorage.setItem('user_preferences', JSON.stringify(cachedData));

      const updatedPreferences = {
        ...mockPreferences,
        timezone: 'America/New_York',
      };
      vi.mocked(preferencesApi.getPreferences).mockResolvedValue(
        updatedPreferences,
      );

      const store = useUserPreferencesStore();

      // Mock fetchInBackground to prevent it from actually running
      const fetchInBackgroundSpy = vi
        .spyOn(store, 'fetchInBackground')
        .mockImplementation(() => Promise.resolve());

      await store.fetchPreferences();

      // Should load from cache immediately
      expect(store.preferences).toEqual(mockPreferences);

      // Should trigger background sync
      expect(fetchInBackgroundSpy).toHaveBeenCalled();
    });

    it('fetches from API when cache is missing', async () => {
      vi.mocked(preferencesApi.getPreferences).mockResolvedValue(
        mockPreferences,
      );

      const store = useUserPreferencesStore();
      await store.fetchPreferences();

      expect(preferencesApi.getPreferences).toHaveBeenCalled();
      expect(store.preferences).toEqual(mockPreferences);

      // Should save to cache
      const cached = localStorage.getItem('user_preferences');
      expect(cached).toBeTruthy();
    });

    it('forces refresh when requested', async () => {
      const cachedData = {
        preferences: mockPreferences,
        timestamp: Date.now() - 60000, // 1 minute ago
      };
      localStorage.setItem('user_preferences', JSON.stringify(cachedData));

      const updatedPreferences = {
        ...mockPreferences,
        theme: 'dark' as const,
      };
      vi.mocked(preferencesApi.getPreferences).mockResolvedValue(
        updatedPreferences,
      );

      const store = useUserPreferencesStore();
      await store.fetchPreferences(true); // Force refresh

      expect(preferencesApi.getPreferences).toHaveBeenCalled();
      expect(store.preferences).toEqual(updatedPreferences);
    });

    it('skips fetch when preferences already loaded and not forcing', async () => {
      vi.mocked(preferencesApi.getPreferences).mockResolvedValue(
        mockPreferences,
      );

      const store = useUserPreferencesStore();
      store.preferences = mockPreferences;

      await store.fetchPreferences();

      expect(preferencesApi.getPreferences).not.toHaveBeenCalled();
    });
  });

  describe('Background Sync', () => {
    it('updates preferences silently in background', async () => {
      const updatedPreferences = {
        ...mockPreferences,
        theme: 'dark' as const,
      };
      vi.mocked(preferencesApi.getPreferences).mockResolvedValue(
        updatedPreferences,
      );

      const store = useUserPreferencesStore();
      await store.fetchInBackground();

      expect(store.preferences).toEqual(updatedPreferences);
      expect(store.lastSync).toBeInstanceOf(Date);

      // Should update cache
      const cached = localStorage.getItem('user_preferences');
      const parsedCache = JSON.parse(cached!);
      expect(parsedCache.preferences.theme).toBe('dark');
    });

    it('handles background sync errors silently', async () => {
      vi.mocked(preferencesApi.getPreferences).mockRejectedValue(
        new Error('Network error'),
      );

      const consoleDebugSpy = vi
        .spyOn(console, 'debug')
        .mockImplementation(() => {});

      const store = useUserPreferencesStore();
      await store.fetchInBackground();

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        'Background preferences sync failed:',
        expect.any(Error),
      );

      consoleDebugSpy.mockRestore();
    });
  });

  describe('Update with Cache', () => {
    it('updates cache after successful preference update', async () => {
      const updates = { timezone: 'America/New_York' };
      const updatedPreferences = { ...mockPreferences, ...updates };

      vi.mocked(preferencesApi.updatePreferences).mockResolvedValue(
        updatedPreferences,
      );

      const store = useUserPreferencesStore();
      store.preferences = mockPreferences;

      await store.updatePreferences(updates);

      // Should update cache
      const cached = localStorage.getItem('user_preferences');
      const parsedCache = JSON.parse(cached!);
      expect(parsedCache.preferences.timezone).toBe('America/New_York');
    });
  });
});
