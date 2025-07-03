import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  GroupServerResponseDto,
  GroupVmResponseDto,
  GroupServerListResponseDto,
  GroupVmListResponseDto,
  ShutdownPreviewListResponseDto,
  ServerGroupListParams,
  VmGroupListParams,
  ShutdownPreviewParams,
  CreateGroupPayload,
  UpdateGroupPayload,
} from './types';
import {
  fetchServerGroups as fetchServerGroupsApi,
  fetchVmGroups as fetchVmGroupsApi,
  previewShutdown as previewShutdownApi,
  executeShutdown as executeShutdownApi,
  fetchGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  toggleGroupCascade,
} from './api';

export const useGroupStore = defineStore('groups', () => {
  const serverGroups = ref<GroupServerListResponseDto | null>(null);
  const vmGroups = ref<GroupVmListResponseDto | null>(null);
  const shutdownPreview = ref<ShutdownPreviewListResponseDto | null>(null);
  const selectedGroupIds = ref<string[]>([]);
  const current = ref<GroupServerResponseDto | GroupVmResponseDto | null>(null);

  const loading = ref(false);
  const isCreating = ref(false);
  const isUpdating = ref(false);
  const isDeleting = ref(false);
  const isLoadingPreview = ref(false);
  const isExecutingShutdown = ref(false);
  const error = ref<string | null>(null);

  const allGroups = computed(() => {
    const groups: (GroupServerResponseDto | GroupVmResponseDto)[] = [];
    if (serverGroups.value) {
      groups.push(...serverGroups.value.items);
    }
    if (vmGroups.value) {
      groups.push(...vmGroups.value.items);
    }
    return groups;
  });

  const selectedGroups = computed(() => {
    return allGroups.value.filter((group) =>
      selectedGroupIds.value.includes(group.id),
    );
  });

  const groupsByPriority = computed(() => {
    const sorted = [...allGroups.value].sort((a, b) => b.priority - a.priority);
    const grouped: Record<
      number,
      (GroupServerResponseDto | GroupVmResponseDto)[]
    > = {};
    sorted.forEach((group) => {
      if (!grouped[group.priority]) {
        grouped[group.priority] = [];
      }
      grouped[group.priority].push(group);
    });
    return grouped;
  });

  const fetchServerGroups = async (params: ServerGroupListParams = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await fetchServerGroupsApi(params);
      serverGroups.value = data;
      return data;
    } catch (err: any) {
      error.value =
        err.response?.data?.message ??
        err.message ??
        'Error loading server groups';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchVmGroups = async (params: VmGroupListParams = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await fetchVmGroupsApi(params);
      vmGroups.value = data;
      return data;
    } catch (err: any) {
      error.value =
        err.response?.data?.message ?? err.message ?? 'Error loading VM groups';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadAllGroups = async (
    serverParams: ServerGroupListParams = {},
    vmParams: VmGroupListParams = {},
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const [{ data: serverData }, { data: vmData }] = await Promise.all([
        fetchServerGroupsApi(serverParams),
        fetchVmGroupsApi(vmParams),
      ]);

      serverGroups.value = serverData;
      vmGroups.value = vmData;

      return { serverGroups: serverData, vmGroups: vmData };
    } catch (err: any) {
      error.value =
        err.response?.data?.message ?? err.message ?? 'Error loading groups';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const previewShutdown = async (
    groupIds: string[],
    params: ShutdownPreviewParams = {},
  ) => {
    isLoadingPreview.value = true;
    error.value = null;

    try {
      const { data } = await previewShutdownApi({ groupIds }, params);
      shutdownPreview.value = data;
      return data;
    } catch (err: any) {
      error.value =
        err.response?.data?.message ??
        err.message ??
        'Error previewing shutdown';
      throw err;
    } finally {
      isLoadingPreview.value = false;
    }
  };

  const executeShutdown = async (
    groupIds: string[],
    params: ShutdownPreviewParams = {},
  ) => {
    isExecutingShutdown.value = true;
    error.value = null;

    try {
      const { data } = await executeShutdownApi({ groupIds }, params);
      return data;
    } catch (err: any) {
      error.value =
        err.response?.data?.message ??
        err.message ??
        'Error executing shutdown';
      throw err;
    } finally {
      isExecutingShutdown.value = false;
    }
  };

  const loadGroup = async (id: string, type: 'server' | 'vm') => {
    loading.value = true;
    error.value = null;

    try {
      current.value = await fetchGroupById(id, type);
      return current.value;
    } catch (err: any) {
      error.value = err.message ?? 'Error loading group';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addGroup = async (payload: CreateGroupPayload) => {
    isCreating.value = true;
    error.value = null;

    try {
      const newGroup = await createGroup(payload);
      await loadAllGroups();
      return newGroup;
    } catch (err: any) {
      error.value =
        err.response?.data?.message ?? err.message ?? 'Error creating group';
      throw err;
    } finally {
      isCreating.value = false;
    }
  };

  const editGroup = async (id: string, payload: UpdateGroupPayload) => {
    isUpdating.value = true;
    error.value = null;

    try {
      const updatedGroup = await updateGroup(id, payload);
      await loadAllGroups();
      if (current.value?.id === id) {
        current.value = updatedGroup;
      }
      return updatedGroup;
    } catch (err: any) {
      error.value =
        err.response?.data?.message ?? err.message ?? 'Error updating group';
      throw err;
    } finally {
      isUpdating.value = false;
    }
  };

  const removeGroup = async (id: string, type: 'server' | 'vm') => {
    isDeleting.value = true;
    error.value = null;

    try {
      await deleteGroup(id, type);
      await loadAllGroups();
      if (current.value?.id === id) {
        current.value = null;
      }
      selectedGroupIds.value = selectedGroupIds.value.filter(
        (gId) => gId !== id,
      );
    } catch (err: any) {
      error.value =
        err.response?.data?.message ?? err.message ?? 'Error deleting group';
      throw err;
    } finally {
      isDeleting.value = false;
    }
  };

  const toggleCascade = async (groupId: string, cascade: boolean) => {
    error.value = null;

    try {
      const updatedGroup = await toggleGroupCascade(groupId, cascade);
      await loadAllGroups();
      if (current.value?.id === groupId) {
        current.value = updatedGroup;
      }
      return updatedGroup;
    } catch (err: any) {
      error.value =
        err.response?.data?.message ??
        err.message ??
        'Error toggling group cascade';
      throw err;
    }
  };

  const toggleGroupSelection = (groupId: string) => {
    const index = selectedGroupIds.value.indexOf(groupId);
    if (index > -1) {
      selectedGroupIds.value.splice(index, 1);
    } else {
      selectedGroupIds.value.push(groupId);
    }
  };

  const clearSelection = () => {
    selectedGroupIds.value = [];
  };

  const selectAllGroups = () => {
    selectedGroupIds.value = allGroups.value.map((group) => group.id);
  };

  const getGroupsByRoom = (roomId: string) => {
    return allGroups.value.filter((group) => group.roomId === roomId);
  };

  const getGroupsByType = (type: 'server' | 'vm') => {
    if (type === 'server') {
      return serverGroups.value?.items ?? [];
    }
    return vmGroups.value?.items ?? [];
  };

  const reset = () => {
    serverGroups.value = null;
    vmGroups.value = null;
    shutdownPreview.value = null;
    selectedGroupIds.value = [];
    current.value = null;
    loading.value = false;
    isCreating.value = false;
    isUpdating.value = false;
    isDeleting.value = false;
    isLoadingPreview.value = false;
    isExecutingShutdown.value = false;
    error.value = null;
  };

  return {
    serverGroups,
    vmGroups,
    shutdownPreview,
    selectedGroupIds,
    current,
    loading,
    isCreating,
    isUpdating,
    isDeleting,
    isLoadingPreview,
    isExecutingShutdown,
    error,
    allGroups,
    selectedGroups,
    groupsByPriority,
    fetchServerGroups,
    fetchVmGroups,
    loadAllGroups,
    previewShutdown,
    executeShutdown,
    loadGroup,
    addGroup,
    editGroup,
    removeGroup,
    toggleCascade,
    toggleGroupSelection,
    clearSelection,
    selectAllGroups,
    getGroupsByRoom,
    getGroupsByType,
    reset,
  };
});
