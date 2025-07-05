import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from '@/services/api';
import { dashboardApi } from '../api';

vi.mock('@/services/api', () => ({
  default: { get: vi.fn() },
}));
const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  mockedAxios.get.mockReset();
  localStorage.clear();
});

describe('dashboardApi.getFullStats', () => {
  it('passes bearer token from localStorage', async () => {
    mockedAxios.get.mockResolvedValue({ data: { ok: true } });
    localStorage.setItem('token', 'abc');
    await dashboardApi.getFullStats();
    expect(mockedAxios.get).toHaveBeenCalledWith('/dashboard/full', {
      headers: { Authorization: 'Bearer abc' },
    });
  });

  it('uses null token when no token stored', async () => {
    mockedAxios.get.mockResolvedValue({ data: {} });
    await dashboardApi.getFullStats();
    expect(mockedAxios.get).toHaveBeenCalledWith('/dashboard/full', {
      headers: { Authorization: 'Bearer null' },
    });
  });
});

describe('dashboardApi.getServerCreations', () => {
  it('returns mocked server creation data', async () => {
    const data = await dashboardApi.getServerCreations();
    expect(data).toHaveLength(6);
    expect(data[0]).toEqual({ month: 'jan', count: 3 });
  });
});

describe('dashboardApi.getUPSLoad', () => {
  it('returns mocked UPS load data', async () => {
    const data = await dashboardApi.getUPSLoad();
    expect(data).toHaveLength(6);
    expect(data[0]).toEqual({ hour: '00h', load: 20 });
  });
});

describe('dashboardApi.getHistoryStats', () => {
  it('calls endpoint with params and token', async () => {
    mockedAxios.get.mockResolvedValue({ data: { jan: 1 } });
    localStorage.setItem('token', 'tok');
    await dashboardApi.getHistoryStats('server', 3);
    expect(mockedAxios.get).toHaveBeenCalledWith('/dashboard/history', {
      params: { entity: 'server', months: 3 },
      headers: { Authorization: 'Bearer tok' },
    });
  });
});
