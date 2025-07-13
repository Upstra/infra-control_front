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
  EnhancedProgressResponse,
} from './types';
import type {
  BulkCreateWithDiscoveryRequestDto,
  BulkCreateWithDiscoveryResponseDto,
} from '@/features/vmware/types';
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
      roomId: ups.roomId || '',
    });
  },

  createServer: async (server: ServerCreationDto) => {
    return createServer({
      name: server.name,
      ip: server.ip,
      state: server.state as 'UP' | 'DOWN',
      adminUrl: server.adminUrl,
      login: server.login,
      password: server.password,
      type: server.type as 'vcenter' | 'esxi',
      priority: server.priority,
      grace_period_on: server.grace_period_on,
      grace_period_off: server.grace_period_off,
      roomId: server.roomId,
      groupId: server.groupId,
      upsId: server.upsId,
      ilo: {
        name: server.ilo_name || '',
        ip: server.ilo_ip || '',
        login: server.ilo_login || '',
        password: server.ilo_password || '',
      },
    });
  },

  bulkCreate: async (
    request: BulkCreateRequest,
  ): Promise<BulkCreateResponse> => {
    const { data } = await axios.post<BulkCreateResponse>(
      '/setup/bulk',
      request,
      getAuthHeaders(),
    );
    return data;
  },

  validateResources: async (
    request: ValidationRequest,
  ): Promise<ValidationResponse> => {
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

  createTemplate: async (
    template: Omit<SetupTemplate, 'id' | 'createdAt' | 'createdBy'>,
  ): Promise<SetupTemplate> => {
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

  validateIp: async (
    ip: string,
  ): Promise<{ exists: boolean; conflictsWith?: string }> => {
    const { data } = await axios.get(
      `/setup/validate/ip?value=${encodeURIComponent(ip)}`,
      getAuthHeaders(),
    );
    return data;
  },

  validateName: async (
    name: string,
    type: 'ups' | 'server' | 'room',
  ): Promise<{ exists: boolean; conflictsWith?: string }> => {
    const { data } = await axios.get(
      `/setup/validate/name?value=${encodeURIComponent(name)}&type=${type}`,
      getAuthHeaders(),
    );
    return data;
  },

  bulkCreateWithDiscovery: async (
    request: BulkCreateWithDiscoveryRequestDto,
  ): Promise<BulkCreateWithDiscoveryResponseDto> => {
    const { data } = await axios.post<BulkCreateWithDiscoveryResponseDto>(
      '/setup/bulk-create-with-discovery',
      request,
      getAuthHeaders(),
    );
    return data;
  },
};
