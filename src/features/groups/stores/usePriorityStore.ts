import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  ServerWithPriority,
  VMWithPriority,
  Priority,
  ServerPriorityResponse,
  VmPriorityResponse,
  SwapServerPriorityResponse,
  SwapVmPriorityResponse,
} from '../types/priority';
import { sortByPriority } from '../utils/priority-utils';
import api from '@/services/api';

export const usePriorityStore = defineStore('priority', () => {
  const servers = ref<ServerWithPriority[]>([]);
  const vms = ref<VMWithPriority[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const sortedServers = computed(() => sortByPriority(servers.value));

  const getVMsByServerId = computed(() => {
    return (serverId: string) => {
      return sortByPriority(vms.value.filter((vm) => vm.serverId === serverId));
    };
  });

  async function fetchServers() {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get<ServerPriorityResponse[]>(
        '/priorities/servers',
      );
      servers.value = (response.data || []).map((server) => ({
        id: server.id,
        name: server.name,
        priority: server.priority,
        ipAddress: server.ipAddress,
        state: server.state,
      }));
    } catch {
      error.value = 'Failed to fetch servers';
      servers.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchVMs() {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get<VmPriorityResponse[]>('/priorities/vms');
      vms.value = (response.data || []).map((vm) => ({
        id: vm.id,
        name: vm.name,
        serverId: vm.serverId,
        priority: vm.priority,
        state: vm.state,
      }));
    } catch {
      error.value = 'Failed to fetch VMs';
      vms.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function updateServerPriority(serverId: string, priority: Priority) {
    const originalServers = [...servers.value];
    const serverIndex = servers.value.findIndex((s) => s.id === serverId);

    if (serverIndex === -1) return;

    servers.value[serverIndex] = { ...servers.value[serverIndex], priority };

    try {
      await api.put(`/servers/${serverId}/priority`, { priority });
    } catch {
      servers.value = originalServers;
      error.value = 'Failed to update server priority';
      throw new Error('Failed to update server priority');
    }
  }

  async function updateVMPriority(vmId: string, priority: Priority) {
    const originalVMs = [...vms.value];
    const vmIndex = vms.value.findIndex((v) => v.id === vmId);

    if (vmIndex === -1) return;

    vms.value[vmIndex] = { ...vms.value[vmIndex], priority };

    try {
      await api.put(`/vms/${vmId}/priority`, { priority });
    } catch {
      vms.value = originalVMs;
      error.value = 'Failed to update VM priority';
      throw new Error('Failed to update VM priority');
    }
  }

  async function swapServerPriorities(server1Id: string, server2Id: string) {
    const originalServers = [...servers.value];

    try {
      const response = await api.post<SwapServerPriorityResponse>(
        '/priorities/servers/swap',
        {
          server1Id,
          server2Id,
        },
      );

      const { server1, server2 } = response.data;
      servers.value = servers.value.map((s) => {
        if (s.id === server1.id) return { ...s, priority: server1.priority };
        if (s.id === server2.id) return { ...s, priority: server2.priority };
        return s;
      });
    } catch {
      servers.value = originalServers;
      error.value = 'Failed to swap server priorities';
      throw new Error('Failed to swap server priorities');
    }
  }

  async function swapVMPriorities(vm1Id: string, vm2Id: string) {
    const originalVMs = [...vms.value];

    try {
      const response = await api.post<SwapVmPriorityResponse>(
        '/priorities/vms/swap',
        {
          vm1Id,
          vm2Id,
        },
      );

      const { vm1, vm2 } = response.data;
      vms.value = vms.value.map((v) => {
        if (v.id === vm1.id) return { ...v, priority: vm1.priority };
        if (v.id === vm2.id) return { ...v, priority: vm2.priority };
        return v;
      });
    } catch {
      vms.value = originalVMs;
      error.value = 'Failed to swap VM priorities';
      throw new Error('Failed to swap VM priorities');
    }
  }

  async function fetchAllData() {
    await Promise.all([fetchServers(), fetchVMs()]);
  }

  return {
    servers,
    vms,
    loading,
    error,
    sortedServers,
    getVMsByServerId,
    fetchServers,
    fetchVMs,
    fetchAllData,
    updateServerPriority,
    updateVMPriority,
    swapServerPriorities,
    swapVMPriorities,
  };
});
