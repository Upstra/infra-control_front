import axios from '@/services/api';
import type { SetupStatus, SetupStep } from './types';

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export const setupApi = {
  getPublicStatus: async (): Promise<SetupStatus> => {
    const { data } = await axios.get<SetupStatus>('/setup/status');
    return data;
  },

  getAuthenticatedStatus: async (): Promise<SetupStatus> => {
    const { data } = await axios.get<SetupStatus>(
      '/setup/status/authenticated',
      getAuthHeaders(),
    );
    return data;
  },

  getStatus: async (): Promise<SetupStatus> => {
    return setupApi.getAuthenticatedStatus();
  },
  completeVmDiscovery: async (payload: {
    serverId: string;
    vmCount: number;
    vmIds: string[];
  }) => {
    const { data } = await axios.post(
      '/setup/vm-discovery/complete',
      payload,
      getAuthHeaders(),
    );
    return data;
  },
  completeStep: async (step: SetupStep, metadata?: Record<string, any>) => {
    const { data } = await axios.post(
      '/setup/step/complete',
      { step, metadata },
      getAuthHeaders(),
    );
    return data;
  },

  getProgress: async () => {
    const { data } = await axios.get('/setup/progress', getAuthHeaders());
    return data;
  },
};
