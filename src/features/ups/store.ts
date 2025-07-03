import { defineStore } from 'pinia';
import { ref } from 'vue';
import { upsApi } from './api';
import type { UpsResponseDto, UpsCreationDto, UpsUpdateDto, UpsListResponse } from './types';

export const useUpsStore = defineStore('ups', () => {
  const list = ref<UpsResponseDto[]>([]);
  const current = ref<UpsResponseDto | null>(null);
  const loading = ref(false);
  const totalItems = ref(0);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const hasMore = ref(true);

  const fetchUps = async (
    page = 1,
    limit = 12,
    append = false,
    searchQuery = '',
  ) => {
    loading.value = true;
    try {
      const response: UpsListResponse = await upsApi.getAllPaginated(page, limit, searchQuery);

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
    } finally {
      loading.value = false;
    }
  };

  const fetchUpsAdmin = async () => {
    loading.value = true;
    try {
      list.value = await upsApi.getAllAdmin();
    } finally {
      loading.value = false;
    }
  };

  const loadMore = async (limit = 12, searchQuery = '') => {
    if (!hasMore.value || loading.value) return;
    await fetchUps(currentPage.value + 1, limit, true, searchQuery);
  };

  const fetchUpsById = async (id: string) => {
    loading.value = true;
    try {
      current.value = await upsApi.getById(id);
      return current.value;
    } finally {
      loading.value = false;
    }
  };

  const createUps = async (payload: UpsCreationDto) => {
    const created = await upsApi.create(payload);
    await fetchUps(1, 12);
    return created;
  };

  const updateUps = async (id: string, payload: UpsUpdateDto) => {
    const updated = await upsApi.update(id, payload);
    await fetchUps(1, 12);
    return updated;
  };

  const deleteUps = async (id: string) => {
    await upsApi.delete(id);
    list.value = list.value.filter((u) => u.id !== id);
  };

  return {
    list,
    current,
    loading,
    totalItems,
    currentPage,
    totalPages,
    hasMore,
    fetchUps,
    fetchUpsAdmin,
    loadMore,
    fetchUpsById,
    createUps,
    updateUps,
    deleteUps,
  };
});
