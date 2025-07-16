import type { AxiosResponse } from 'axios';
import apiClient from '@/services/api';
import type {
  DestinationsListResponse,
  DestinationsConfigRequest,
  MigrationStartRequest,
  MigrationResponse,
  MigrationStatus,
  VmsForMigrationResponse,
} from './types';

export const migrationApi = {
  async getDestinations(): Promise<AxiosResponse<DestinationsListResponse>> {
    return apiClient.get('/vmware/migration/destinations');
  },

  async configureDestinations(
    data: DestinationsConfigRequest,
  ): Promise<AxiosResponse<MigrationResponse>> {
    return apiClient.post('/vmware/migration/destinations', data);
  },

  async removeDestination(
    sourceServerId: string,
  ): Promise<AxiosResponse<MigrationResponse>> {
    if (!sourceServerId || sourceServerId === 'undefined' || sourceServerId === 'null') {
      throw new Error(`Invalid sourceServerId: ${sourceServerId}`);
    }
    return apiClient.delete(`/vmware/migration/destinations/${sourceServerId}`);
  },

  async startMigration(
    data: MigrationStartRequest = {},
  ): Promise<AxiosResponse<MigrationResponse>> {
    return apiClient.post('/vmware/servers/migration/plan', data);
  },

  async startRestart(): Promise<AxiosResponse<MigrationResponse>> {
    return apiClient.post('/vmware/servers/migration/restart');
  },

  async getStatus(): Promise<AxiosResponse<MigrationStatus>> {
    return apiClient.get('/vmware/servers/migration/status');
  },

  async clearMigrationData(): Promise<AxiosResponse<void>> {
    return apiClient.delete('XTg');
  },

  async getVmsForMigration(): Promise<AxiosResponse<VmsForMigrationResponse>> {
    return apiClient.get('/vmware/migration/vms');
  },
};
