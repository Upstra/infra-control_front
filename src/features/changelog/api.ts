import axios from '@/services/api';
import type { ChangelogResponse } from './types';

export const changelogApi = {
  /** Fetch releases for frontend and backend */
  fetchReleases: async (page = 1, limit = 10): Promise<ChangelogResponse> => {
    const { data } = await axios.get<ChangelogResponse>('/releases', {
      params: { page, limit },
    });
    return data;
  },
};
