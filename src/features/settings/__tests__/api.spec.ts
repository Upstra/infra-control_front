import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from '@/services/api';
import { preferencesApi } from '../api';
import type { UserPreferences, UserPreferencesUpdateDto } from '../types';

vi.mock('@/services/api');

const mockPreferences: UserPreferences = {
  id: '1',
  userId: 'user1',
  locale: 'fr',
  theme: 'dark',
  timezone: 'UTC',
  notifications: {
    server: true,
    ups: true,
    email: false,
    push: true,
  },
  display: {
    defaultUserView: 'table',
    defaultServerView: 'grid',
    defaultUpsView: 'grid',
    defaultRoomView: 'grid',
    defaultGroupView: 'grid' as const,
    compactMode: false,
  },
  integrations: {},
  performance: {
    autoRefresh: true,
    refreshInterval: 60,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('preferencesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPreferences', () => {
    it('fetches user preferences', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockPreferences });

      const result = await preferencesApi.getPreferences();

      expect(axios.get).toHaveBeenCalledWith('/user/me/preferences');
      expect(result).toEqual(mockPreferences);
    });

    it('handles error when fetching preferences', async () => {
      const error = new Error('Network error');
      vi.mocked(axios.get).mockRejectedValue(error);

      await expect(preferencesApi.getPreferences()).rejects.toThrow(
        'Network error',
      );
    });
  });

  describe('updatePreferences', () => {
    it('updates user preferences', async () => {
      const updates: UserPreferencesUpdateDto = {
        timezone: 'Europe/Paris',
        notifications: {
          server: true,
          ups: true,
          email: true,
          push: true,
        },
      };
      const updatedPreferences = { ...mockPreferences, ...updates };

      vi.mocked(axios.patch).mockResolvedValue({ data: updatedPreferences });

      const result = await preferencesApi.updatePreferences(updates);

      expect(axios.patch).toHaveBeenCalledWith('/user/me/preferences', updates);
      expect(result).toEqual(updatedPreferences);
    });

    it('handles partial updates', async () => {
      const updates: UserPreferencesUpdateDto = {
        theme: 'light',
      };

      vi.mocked(axios.patch).mockResolvedValue({
        data: { ...mockPreferences, theme: 'light' },
      });

      const result = await preferencesApi.updatePreferences(updates);

      expect(axios.patch).toHaveBeenCalledWith('/user/me/preferences', updates);
      expect(result.theme).toBe('light');
    });

    it('handles error when updating preferences', async () => {
      const error = new Error('Validation error');
      vi.mocked(axios.patch).mockRejectedValue(error);

      await expect(
        preferencesApi.updatePreferences({ timezone: 'Invalid' }),
      ).rejects.toThrow('Validation error');
    });
  });

  describe('resetPreferences', () => {
    it('resets preferences to defaults', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: mockPreferences });

      const result = await preferencesApi.resetPreferences();

      expect(axios.post).toHaveBeenCalledWith('/user/me/preferences/reset');
      expect(result).toEqual(mockPreferences);
    });

    it('handles error when resetting preferences', async () => {
      const error = new Error('Server error');
      vi.mocked(axios.post).mockRejectedValue(error);

      await expect(preferencesApi.resetPreferences()).rejects.toThrow(
        'Server error',
      );
    });
  });
});
