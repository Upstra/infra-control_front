import type { AxiosResponse } from 'axios';
import apiClient from '@/services/api';
import type {
  DestinationsListResponse,
  DestinationsConfigRequest,
  MigrationStartRequest,
  MigrationResponse,
  MigrationStatus,
} from './types';

export const migrationApi = {
  async getDestinations(): Promise<AxiosResponse<DestinationsListResponse>> {
    return apiClient.get('/api/vmware/servers/migration/destinations');
  },

  async configureDestinations(
    data: DestinationsConfigRequest,
  ): Promise<AxiosResponse<MigrationResponse>> {
    return apiClient.post('/api/vmware/servers/migration/destinations', data);
  },

  async removeDestination(
    sourceServerId: string,
  ): Promise<AxiosResponse<MigrationResponse>> {
    return apiClient.delete(
      `/api/vmware/servers/migration/destinations/${sourceServerId}`,
    );
  },

  async startMigration(
    data: MigrationStartRequest = {},
  ): Promise<AxiosResponse<MigrationResponse>> {
    return apiClient.post('/api/vmware/servers/migration/plan', data);
  },

  async startRestart(): Promise<AxiosResponse<MigrationResponse>> {
    return apiClient.post('/api/vmware/servers/migration/restart');
  },

  async getStatus(): Promise<AxiosResponse<MigrationStatus>> {
    return apiClient.get('/api/vmware/servers/migration/status');
  },

  async clearMigrationData(): Promise<AxiosResponse<void>> {
    return apiClient.delete('/api/vmware/servers/migration');
  },
};
