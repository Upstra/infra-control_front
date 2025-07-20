import axios from '@/services/api';
import type {
  DiscoveryStartDto,
  DiscoverySessionDto,
  ActiveDiscoveryDto,
} from './types';

class VMwareDiscoveryApi {
  private readonly baseUrl = '/vmware/servers/discovery';

  /**
   * Start a new discovery session
   * @param serverIds Optional array of specific server IDs to discover
   */
  async startDiscovery(serverIds?: number[]): Promise<DiscoveryStartDto> {
    const response = await axios.post<DiscoveryStartDto>(
      `${this.baseUrl}/start`,
      {
        serverIds,
      },
    );
    return response.data;
  }

  /**
   * Check if there's an active discovery session
   */
  async getActiveDiscovery(): Promise<ActiveDiscoveryDto> {
    const response = await axios.get<ActiveDiscoveryDto>(
      `${this.baseUrl}/active`,
    );
    return response.data;
  }

  /**
   * Get a specific discovery session by ID
   * @param sessionId The session ID to retrieve
   */
  async getDiscoverySession(sessionId: string): Promise<DiscoverySessionDto> {
    const response = await axios.get<DiscoverySessionDto>(
      `${this.baseUrl}/session/${sessionId}`,
    );
    return response.data;
  }

  /**
   * Cancel an active discovery session
   * @param sessionId The session ID to cancel
   */
  async cancelDiscovery(sessionId: string): Promise<void> {
    await axios.post(`${this.baseUrl}/cancel/${sessionId}`);
  }
}

export const vmwareDiscoveryApi = new VMwareDiscoveryApi();

/**
 * Control VM power state
 * @param moid The VM managed object ID
 * @param action The power action to perform
 */
export async function controlVmPower(
  moid: string,
  action: 'on' | 'off' | 'reset' | 'suspend',
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await axios.post(`/vmware/servers/vms/${moid}/power`, {
      action,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || `Failed to ${action} VM`);
  }
}

/**
 * Synchronize VMs from VMware servers
 */
export async function syncVMs(): Promise<{
  success: boolean;
  message: string;
  totalVMs?: number;
  changes?: number;
  duration?: string;
  errors?: Array<{
    serverName: string;
    error: string;
  }>;
}> {
  try {
    const response = await axios.post('/vmware/servers/vms/sync');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to sync VMs');
  }
}
