import axios from '@/services/api';
import type { SetupStatus, SetupStep, RoomCreationDto, UpsCreationDto, ServerCreationDto } from './types';
import { roomApi } from '@/features/rooms/api';
import { upsApi } from '@/features/ups/api';
import { serverApi } from '@/features/servers/api';

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

  createRoom: async (room: RoomCreationDto) => {
    return roomApi.createRoom({ name: room.name });
  },

  createUps: async (ups: UpsCreationDto) => {
    return upsApi.create(ups);
  },

  createServer: async (server: ServerCreationDto) => {
    return serverApi.create(server);
  },
};
