import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Group,
  CreateGroupPayload,
  UpdateGroupPayload,
  GroupListResponse,
  GroupListParams,
  GroupType,
  ServerGroup,
  VmGroup,
} from './types';
import {
  fetchGroups as fetchGroupsApi,
  fetchServerGroups as fetchServerGroupsApi,
  fetchVmGroups as fetchVmGroupsApi,
  fetchGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addResourcesToGroup,
  removeResourcesFromGroup,
} from './api';

export const useGroupStore = defineStore('groups', () => {
  const list = ref<Group[]>([]);
  const current = ref<Group | null>(null);
  const loading = ref(false);
  const isCreating = ref(false);
  const isUpdating = ref(false);
  const isDeleting = ref(false);
  const error = ref<string | null>(null);
  const totalItems = ref(0);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const hasMore = ref(true);

  const serverGroups = computed(() => 
    list.value.filter((group): group is ServerGroup => group.type === 'server')
  );

  const vmGroups = computed(() => 
    list.value.filter((group): group is VmGroup => group.type === 'vm')
  );

  const groupsByPriority = computed(() => {
    const sorted = [...list.value].sort((a, b) => a.priority - b.priority);
    return {
      1: sorted.filter(g => g.priority === 1),
      2: sorted.filter(g => g.priority === 2),
      3: sorted.filter(g => g.priority === 3),
      4: sorted.filter(g => g.priority === 4),
    };
  });

  const fetchGroups = async (
    params: GroupListParams = {},
    append = false,
  ) => {
    loading.value = true;
    error.value = null;
    
    try {
      const res = await fetchGroupsApi(params);
      const response: GroupListResponse = res.data;

      if (append) {
        list.value = [...list.value, ...response.items];
      } else {
        list.value = response.items;
      }

      totalItems.value = response.totalItems;
      currentPage.value = response.currentPage;
      totalPages.value = response.totalPages;
      hasMore.value = response.currentPage < response.totalPages;
      
      return response;
    } catch (err: any) {
      error.value = err.message ?? 'Error loading groups';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchServerGroups = async (params: GroupListParams = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const res = await fetchServerGroupsApi(params);
      const response: GroupListResponse = res.data;
      list.value = response.items;
      totalItems.value = response.totalItems;
      return response;
    } catch (err: any) {
      error.value = err.message ?? 'Error loading server groups';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchVmGroups = async (params: GroupListParams = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const res = await fetchVmGroupsApi(params);
      const response: GroupListResponse = res.data;
      list.value = response.items;
      totalItems.value = response.totalItems;
      return response;
    } catch (err: any) {
      error.value = err.message ?? 'Error loading VM groups';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadMore = async (params: GroupListParams = {}) => {
    if (!hasMore.value || loading.value) return;
    await fetchGroups({ ...params, page: currentPage.value + 1 }, true);
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

  const addGroup = async (payload: CreateGroupPayload) => {
    isCreating.value = true;
    error.value = null;
    
    try {
      const newGroup = await createGroup(payload);
      await fetchGroups({ page: 1, limit: 12 });
      return newGroup;
    } catch (err: any) {
      error.value =
        err.response?.data?.message ??
        err.message ??
        'Error creating group';
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
      const index = list.value.findIndex(g => g.id === id);
      if (index !== -1) {
        list.value[index] = updatedGroup;
      }
      if (current.value?.id === id) {
        current.value = updatedGroup;
      }
      return updatedGroup;
    } catch (err: any) {
      error.value =
        err.response?.data?.message ??
        err.message ??
        'Error updating group';
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
      list.value = list.value.filter(g => g.id !== id);
      if (current.value?.id === id) {
        current.value = null;
      }
      totalItems.value--;
    } catch (err: any) {
      error.value =
        err.response?.data?.message ??
        err.message ??
        'Error deleting group';
      throw err;
    } finally {
      isDeleting.value = false;
    }
  };

  const addResources = async (groupId: string, resourceIds: string[]) => {
    error.value = null;
    
    try {
      const updatedGroup = await addResourcesToGroup(groupId, resourceIds);
      const index = list.value.findIndex(g => g.id === groupId);
      if (index !== -1) {
        list.value[index] = updatedGroup;
      }
      if (current.value?.id === groupId) {
        current.value = updatedGroup;
      }
      return updatedGroup;
    } catch (err: any) {
      error.value =
        err.response?.data?.message ??
        err.message ??
        'Error adding resources to group';
      throw err;
    }
  };

  const removeResources = async (groupId: string, resourceIds: string[]) => {
    error.value = null;
    
    try {
      const updatedGroup = await removeResourcesFromGroup(groupId, resourceIds);
      const index = list.value.findIndex(g => g.id === groupId);
      if (index !== -1) {
        list.value[index] = updatedGroup;
      }
      if (current.value?.id === groupId) {
        current.value = updatedGroup;
      }
      return updatedGroup;
    } catch (err: any) {
      error.value =
        err.response?.data?.message ??
        err.message ??
        'Error removing resources from group';
      throw err;
    }
  };

  const getGroupsByType = (type: GroupType) => {
    return list.value.filter(group => group.type === type);
  };

  const getGroupsByRoom = (roomId: string) => {
    return list.value.filter(group => group.roomId === roomId);
  };

  const reset = () => {
    list.value = [];
    current.value = null;
    loading.value = false;
    isCreating.value = false;
    isUpdating.value = false;
    isDeleting.value = false;
    error.value = null;
    totalItems.value = 0;
    currentPage.value = 1;
    totalPages.value = 1;
    hasMore.value = true;
  };

  return {
    list,
    current,
    loading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    totalItems,
    currentPage,
    totalPages,
    hasMore,
    serverGroups,
    vmGroups,
    groupsByPriority,
    fetchGroups,
    fetchServerGroups,
    fetchVmGroups,
    loadMore,
    loadGroup,
    addGroup,
    editGroup,
    removeGroup,
    addResources,
    removeResources,
    getGroupsByType,
    getGroupsByRoom,
    reset,
  };
});