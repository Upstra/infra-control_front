import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRealTimeValidation } from '../composables/useRealTimeValidation';
import { setupApi } from '../api';

vi.mock('../api', () => ({
  setupApi: {
    validateIp: vi.fn(),
    validateName: vi.fn(),
  },
}));

const mockedSetupApi = vi.mocked(setupApi);

describe('useRealTimeValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateIp', () => {
    it('returns valid for empty IP', async () => {
      const { validateIpImmediate } = useRealTimeValidation();
      const result = await validateIpImmediate('');

      expect(result.isValid).toBe(true);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it('returns valid for whitespace-only IP', async () => {
      const { validateIpImmediate } = useRealTimeValidation();
      const result = await validateIpImmediate('   ');

      expect(result.isValid).toBe(true);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it('calls API for valid IP and returns success', async () => {
      mockedSetupApi.validateIp.mockResolvedValue({ exists: false });
      const { validateIpImmediate } = useRealTimeValidation();

      const result = await validateIpImmediate('192.168.1.100');

      expect(mockedSetupApi.validateIp).toHaveBeenCalledWith('192.168.1.100');
      expect(result.isValid).toBe(true);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it('returns error when IP exists', async () => {
      mockedSetupApi.validateIp.mockResolvedValue({
        exists: true,
        conflictsWith: 'Server-001',
      });
      const { validateIpImmediate } = useRealTimeValidation();

      const result = await validateIpImmediate('192.168.1.100');

      expect(result.isValid).toBe(false);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe('IP déjà utilisée par Server-001');
      expect(result.conflictsWith).toBe('Server-001');
    });

    it('falls back gracefully on API error', async () => {
      mockedSetupApi.validateIp.mockRejectedValue(new Error('Network error'));
      const { validateIpImmediate } = useRealTimeValidation();

      const result = await validateIpImmediate('192.168.1.100');

      expect(result.isValid).toBe(true);
      expect(result.isLoading).toBe(false);
    });

    it('uses cache for repeated requests', async () => {
      mockedSetupApi.validateIp.mockResolvedValue({ exists: false });
      const { validateIpImmediate } = useRealTimeValidation();

      await validateIpImmediate('192.168.1.100');
      await validateIpImmediate('192.168.1.100');

      expect(mockedSetupApi.validateIp).toHaveBeenCalledTimes(1);
    });
  });

  describe('validateName', () => {
    it('returns valid for empty name', async () => {
      const { validateNameImmediate } = useRealTimeValidation();
      const result = await validateNameImmediate('', 'server');

      expect(result.isValid).toBe(true);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it('calls API for valid name and returns success', async () => {
      mockedSetupApi.validateName.mockResolvedValue({ exists: false });
      const { validateNameImmediate } = useRealTimeValidation();

      const result = await validateNameImmediate('Server-001', 'server');

      expect(mockedSetupApi.validateName).toHaveBeenCalledWith(
        'Server-001',
        'server',
      );
      expect(result.isValid).toBe(true);
      expect(result.isLoading).toBe(false);
    });

    it('returns error when name exists for UPS', async () => {
      mockedSetupApi.validateName.mockResolvedValue({
        exists: true,
        conflictsWith: 'UPS-Datacenter-1',
      });
      const { validateNameImmediate } = useRealTimeValidation();

      const result = await validateNameImmediate('UPS-Main', 'ups');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Nom déjà utilisé par UPS-Datacenter-1');
      expect(result.conflictsWith).toBe('UPS-Datacenter-1');
    });

    it('falls back gracefully on API error', async () => {
      mockedSetupApi.validateName.mockRejectedValue(new Error('Network error'));
      const { validateNameImmediate } = useRealTimeValidation();

      const result = await validateNameImmediate('Server-001', 'server');

      expect(result.isValid).toBe(true);
      expect(result.isLoading).toBe(false);
    });

    it('uses different cache keys for different types', async () => {
      mockedSetupApi.validateName.mockResolvedValue({ exists: false });
      const { validateNameImmediate } = useRealTimeValidation();

      await validateNameImmediate('Main', 'server');
      await validateNameImmediate('Main', 'ups');

      expect(mockedSetupApi.validateName).toHaveBeenCalledTimes(2);
      expect(mockedSetupApi.validateName).toHaveBeenNthCalledWith(
        1,
        'Main',
        'server',
      );
      expect(mockedSetupApi.validateName).toHaveBeenNthCalledWith(
        2,
        'Main',
        'ups',
      );
    });
  });

  describe('cache functionality', () => {
    it('clears cache when requested', async () => {
      mockedSetupApi.validateIp.mockResolvedValue({ exists: false });
      const { validateIpImmediate, clearCache } = useRealTimeValidation();

      await validateIpImmediate('192.168.1.100');
      clearCache();
      await validateIpImmediate('192.168.1.100');

      expect(mockedSetupApi.validateIp).toHaveBeenCalledTimes(2);
    });

    it('expires cache after TTL', async () => {
      mockedSetupApi.validateIp.mockResolvedValue({ exists: false });
      const { validateIpImmediate } = useRealTimeValidation();

      // Mock Date.now to simulate time passing
      const originalNow = Date.now;
      let currentTime = 1000000;
      Date.now = vi.fn(() => currentTime);

      await validateIpImmediate('192.168.1.100');

      // Advance time by 6 minutes (more than 5 minute TTL)
      currentTime += 6 * 60 * 1000;

      await validateIpImmediate('192.168.1.100');

      expect(mockedSetupApi.validateIp).toHaveBeenCalledTimes(2);

      // Restore original Date.now
      Date.now = originalNow;
    });
  });
});
