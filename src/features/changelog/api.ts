import axios from '@/services/api';
import type { ChangelogResponse } from './types';

export const changelogApi = {
  /** Fetch releases for frontend and backend */
  fetchReleases: async (): Promise<ChangelogResponse> => {
    const { data } = await axios.get<ChangelogResponse>('/releases');
    return data;
  },
};
