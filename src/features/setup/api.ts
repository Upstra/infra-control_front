import axios from '@/services/api';
import type { 
  SetupStatus, 
  SetupStep, 
  RoomCreationDto, 
  UpsCreationDto, 
  ServerCreationDto,
  BulkCreateRequest,
  BulkCreateResponse,
  ValidationRequest,
  ValidationResponse,
  SetupTemplate,
  EnhancedProgressResponse
} from './types';
import { roomApi } from '@/features/rooms/api';
import { upsApi } from '@/features/ups/api';
import { createServer } from '@/features/servers/api';

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
    return upsApi.create({
      name: ups.name,
      ip: ups.ip || '',
      roomId: ups.roomId || ''
    });
  },

  createServer: async (server: ServerCreationDto) => {
    return createServer(server);
  },

  bulkCreate: async (request: BulkCreateRequest): Promise<BulkCreateResponse> => {
    const { data } = await axios.post<BulkCreateResponse>(
      '/setup/bulk',
      request,
      getAuthHeaders(),
    );
    return data;
  },

  validateResources: async (request: ValidationRequest): Promise<ValidationResponse> => {
    const { data } = await axios.post<ValidationResponse>(
      '/setup/validate',
      request,
      getAuthHeaders(),
    );
    return data;
  },

  getTemplates: async (): Promise<{ templates: SetupTemplate[] }> => {
    const { data } = await axios.get<{ templates: SetupTemplate[] }>(
      '/setup/templates',
      getAuthHeaders(),
    );
    return data;
  },

  createTemplate: async (template: Omit<SetupTemplate, 'id' | 'createdAt' | 'createdBy'>): Promise<SetupTemplate> => {
    const { data } = await axios.post<SetupTemplate>(
      '/setup/templates',
      template,
      getAuthHeaders(),
    );
    return data;
  },

  getEnhancedProgress: async (): Promise<EnhancedProgressResponse> => {
    const { data } = await axios.get<EnhancedProgressResponse>(
      '/setup/progress/enhanced',
      getAuthHeaders(),
    );
    return data;
  },
};
