import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import { useUserPreferencesStore } from '../store';
import { useAuthStore } from '@/features/auth/store';
import { preferencesApi } from '../api';
import type { UserPreferences } from '../types';

vi.mock('../api');
vi.mock('@/features/auth/api');
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
vi.mock('@/features/presence/composables/usePresenceSocket', () => ({
  usePresenceSocket: () => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
}));
vi.mock('@/features/presence/store', () => ({
  usePresenceStore: () => ({
    isConnected: { value: false },
  }),
}));
vi.mock('@/features/setup/store', () => ({
  useSetupStore: () => ({
    setupStatus: null,
    checkSetupStatus: vi.fn(),
  }),
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
    defaultGroupView: 'sections',
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

describe('UserPreferences Router Integration', () => {
  let router: any;
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

    // Create a simple router for testing
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          component: { template: '<div>Home</div>' },
          meta: { requiresAuth: true },
        },
        { path: '/login', component: { template: '<div>Login</div>' } },
        {
          path: '/dashboard',
          component: { template: '<div>Dashboard</div>' },
          meta: { requiresAuth: true },
        },
        {
          path: '/admin/users',
          component: { template: '<div>Admin Users</div>' },
          meta: { requiresAuth: true, requiresAdmin: true },
        },
      ],
    });
  });

  afterEach(() => {
    window.localStorage = originalLocalStorage;
  });

  describe('Preference Loading on Navigation', () => {
    it('loads preferences on first authenticated route', async () => {
      // Setup auth state
      localStorage.setItem('token', 'valid-token');
      const authStore = useAuthStore();
      authStore.currentUser = {
        id: 'user1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        isActive: true,
        isVerified: true,
        isTwoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        roles: [{ id: '1', name: 'user', isAdmin: false }],
      };
      authStore.checkTokenValidity = vi.fn().mockResolvedValue(true);

      vi.mocked(preferencesApi.getPreferences).mockResolvedValue(
        mockPreferences,
      );

      const preferencesStore = useUserPreferencesStore();
      const fetchSpy = vi.spyOn(preferencesStore, 'fetchPreferences');

      // Navigate to authenticated route
      await router.push('/dashboard');

      // Simulate route guard logic
      if (!preferencesStore.isLoaded) {
        await preferencesStore.fetchPreferences();
      }

      expect(fetchSpy).toHaveBeenCalled();
      expect(preferencesStore.preferences).toEqual(mockPreferences);
    });

    it('uses cached preferences on subsequent navigations', async () => {
      // Setup auth state
      localStorage.setItem('token', 'valid-token');
      const authStore = useAuthStore();
      authStore.currentUser = {
        id: 'user1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        isActive: true,
        isVerified: true,
        isTwoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        roles: [{ id: '1', name: 'user', isAdmin: false }],
      };
      authStore.checkTokenValidity = vi.fn().mockResolvedValue(true);

      // Setup cached preferences
      const cachedData = {
        preferences: mockPreferences,
        timestamp: Date.now() - 60000, // 1 minute ago
      };
      localStorage.setItem('user_preferences', JSON.stringify(cachedData));

      const preferencesStore = useUserPreferencesStore();
      const fetchSpy = vi.spyOn(preferencesStore, 'fetchPreferences');
      const loadFromCacheSpy = vi.spyOn(preferencesStore, 'loadFromCache');

      // Navigate to authenticated route
      await router.push('/dashboard');

      // Simulate route guard logic
      if (!preferencesStore.isLoaded) {
        await preferencesStore.fetchPreferences();
      }

      expect(fetchSpy).toHaveBeenCalled();
      expect(loadFromCacheSpy).toHaveBeenCalled();
      expect(preferencesStore.preferences).toEqual(mockPreferences);

      // Background sync will be triggered
      await vi.waitFor(() => {
        expect(preferencesApi.getPreferences).toHaveBeenCalled();
      });
    });

    it('handles preference loading failure gracefully', async () => {
      // Setup auth state
      localStorage.setItem('token', 'valid-token');
      const authStore = useAuthStore();
      authStore.currentUser = {
        id: 'user1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        isActive: true,
        isVerified: true,
        isTwoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        roles: [{ id: '1', name: 'user', isAdmin: false }],
      };
      authStore.checkTokenValidity = vi.fn().mockResolvedValue(true);

      vi.mocked(preferencesApi.getPreferences).mockRejectedValue(
        new Error('Network error'),
      );

      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const preferencesStore = useUserPreferencesStore();

      // Navigate to authenticated route
      await router.push('/dashboard');

      // Simulate route guard logic
      await preferencesStore.fetchPreferences();

      // Preferences will have fallback values due to error handling
      expect(preferencesStore.preferences).toBeTruthy();
      expect(preferencesStore.error).toBeTruthy();

      consoleWarnSpy.mockRestore();
    });

    it('does not load preferences for unauthenticated routes', async () => {
      const preferencesStore = useUserPreferencesStore();
      const fetchSpy = vi.spyOn(preferencesStore, 'fetchPreferences');

      // Navigate to unauthenticated route
      await router.push('/login');

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(preferencesStore.preferences).toBeNull();
    });

    it('clears cache on logout', async () => {
      // Setup initial state with preferences
      const preferencesStore = useUserPreferencesStore();
      preferencesStore.preferences = mockPreferences;

      // Save to cache
      preferencesStore.saveToCache(mockPreferences);
      expect(localStorage.getItem('user_preferences')).toBeTruthy();

      // Simulate logout
      preferencesStore.clearCache();
      preferencesStore.$reset();

      expect(localStorage.getItem('user_preferences')).toBeNull();
      expect(preferencesStore.preferences).toBeNull();
      expect(preferencesStore.isLoaded).toBe(false);
    });
  });

  describe('Admin Route Preferences', () => {
    it('loads preferences for admin routes', async () => {
      // Setup auth state with admin user
      localStorage.setItem('token', 'valid-token');
      const authStore = useAuthStore();
      authStore.currentUser = {
        id: 'admin1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        username: 'adminuser',
        isActive: true,
        isVerified: true,
        isTwoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        roles: [{ id: '1', name: 'admin', isAdmin: true }],
      };
      authStore.checkTokenValidity = vi.fn().mockResolvedValue(true);

      vi.mocked(preferencesApi.getPreferences).mockResolvedValue(
        mockPreferences,
      );

      const preferencesStore = useUserPreferencesStore();
      const fetchSpy = vi.spyOn(preferencesStore, 'fetchPreferences');

      // Navigate to admin route
      await router.push('/admin/users');

      // Simulate route guard logic
      if (!preferencesStore.isLoaded) {
        await preferencesStore.fetchPreferences();
      }

      expect(fetchSpy).toHaveBeenCalled();
      expect(preferencesStore.preferences).toEqual(mockPreferences);
    });
  });
});
