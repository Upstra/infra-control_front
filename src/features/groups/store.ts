import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  GroupResponseDto,
  PaginatedGroupResponseDto,
  PreviewShutdownResponseDto,
  GroupQueryDto,
  CreateGroupDto,
  UpdateGroupDto,
  GroupShutdownDto,
  GroupType,
} from './types';
import {
  fetchGroups,
  fetchGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  previewGroupShutdown,
  executeGroupShutdown,
} from './api';

export const useGroupStore = defineStore('groups', () => {
  const groups = ref<PaginatedGroupResponseDto | null>(null);
  const shutdownPreview = ref<PreviewShutdownResponseDto | null>(null);
  const selectedGroupIds = ref<string[]>([]);
  const current = ref<GroupResponseDto | null>(null);

  const loading = ref(false);
  const isCreating = ref(false);
  const isUpdating = ref(false);
  const isDeleting = ref(false);
  const isLoadingPreview = ref(false);
  const isExecutingShutdown = ref(false);
  const error = ref<string | null>(null);

  const allGroups = computed(() => {
    return groups.value?.data ?? [];
  });

  const selectedGroups = computed(() => {
    return allGroups.value.filter((group) =>
      selectedGroupIds.value.includes(group.id),
    );
  });

  const serverGroups = computed(() => {
    return allGroups.value.filter((group) => group.type === 'SERVER');
  });

  const vmGroups = computed(() => {
    return allGroups.value.filter((group) => group.type === 'VM');
  });

  const fetchAllGroups = async (params: GroupQueryDto = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetchGroups(params);
      groups.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value =
        err.response?.data?.message ?? err.message ?? 'Error loading groups';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchServerGroups = async (params: GroupQueryDto = {}) => {
    return fetchAllGroups({ ...params, type: 'SERVER' });
  };

  const fetchVmGroups = async (params: GroupQueryDto = {}) => {
    return fetchAllGroups({ ...params, type: 'VM' });
  };

  const previewGroupShutdownById = async (groupId: string) => {
    isLoadingPreview.value = true;
    error.value = null;

    try {
      const response = await previewGroupShutdown(groupId);
      shutdownPreview.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value =
        err.response?.data?.message ??
        err.message ??
        'Error previewing group shutdown';
      throw err;
    } finally {
      isLoadingPreview.value = false;
    }
  };

  const executeGroupShutdownById = async (
    groupId: string,
    payload: GroupShutdownDto = {},
  ) => {
    isExecutingShutdown.value = true;
    error.value = null;

    try {
      const response = await executeGroupShutdown(groupId, payload);
      return response.data;
    } catch (err: any) {
      error.value =
        err.response?.data?.message ??
        err.message ??
        'Error executing group shutdown';
      throw err;
    } finally {
      isExecutingShutdown.value = false;
    }
  };

  const loadGroup = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      current.value = await fetchGroupById(id);
      return current.value;
    } catch (err: any) {
      error.value = err.message ?? 'Error loading group';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addGroup = async (payload: CreateGroupDto) => {
    isCreating.value = true;
    error.value = null;

    try {
      const newGroup = await createGroup(payload);
      await fetchAllGroups();
      return newGroup;
    } catch (err: any) {
      error.value =
        err.response?.data?.message ?? err.message ?? 'Error creating group';
      throw err;
    } finally {
      isCreating.value = false;
    }
  };

  const editGroup = async (id: string, payload: UpdateGroupDto) => {
    isUpdating.value = true;
    error.value = null;

    try {
      const updatedGroup = await updateGroup(id, payload);
      await fetchAllGroups();
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

  const removeGroup = async (id: string) => {
    isDeleting.value = true;
    error.value = null;

    try {
      await deleteGroup(id);
      await fetchAllGroups();
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

  const getGroupsByType = (type: GroupType) => {
    return allGroups.value.filter((group) => group.type === type);
  };

  const reset = () => {
    groups.value = null;
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
    groups,
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
    serverGroups,
    vmGroups,
    fetchAllGroups,
    fetchServerGroups,
    fetchVmGroups,
    previewGroupShutdownById,
    executeGroupShutdownById,
    loadGroup,
    addGroup,
    editGroup,
    removeGroup,
    toggleGroupSelection,
    clearSelection,
    selectAllGroups,
    getGroupsByType,
    reset,
  };
});
