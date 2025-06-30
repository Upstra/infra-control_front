import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from '@/services/api';
import { changelogApi } from '../api';
import { getMockChangelog } from '../mock';

vi.mock('@/services/api', () => ({
  default: { get: vi.fn() },
}));
const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };

beforeEach(() => {
  mockedAxios.get.mockReset();
});

describe('changelogApi.fetchReleases', () => {
  it('calls /releases endpoint with params', async () => {
    mockedAxios.get.mockResolvedValue({ data: { frontend: {}, backend: {} } });
    await changelogApi.fetchReleases(2, 5);
    expect(mockedAxios.get).toHaveBeenCalledWith('/releases', {
      params: { page: 2, limit: 5 },
    });
  });

  it('uses defaults', async () => {
    mockedAxios.get.mockResolvedValue({ data: { frontend: {}, backend: {} } });
    await changelogApi.fetchReleases();
    expect(mockedAxios.get).toHaveBeenCalledWith('/releases', {
      params: { page: 1, limit: 10 },
    });
  });
});

describe('getMockChangelog', () => {
  it('returns mock data', () => {
    const data = getMockChangelog();
    expect(data.frontend.items.length).toBeGreaterThan(0);
    expect(data.backend.items.length).toBeGreaterThan(0);
  });
});
