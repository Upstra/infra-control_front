import { defineStore } from 'pinia';
import { ref } from 'vue';
import { upsApi } from './api';
import type { UpsResponseDto, UpsCreationDto, UpsUpdateDto } from './types';

export const useUpsStore = defineStore('ups', () => {
  const list = ref<UpsResponseDto[]>([]);
  const current = ref<UpsResponseDto | null>(null);
  const loading = ref(false);

  const fetchUps = async () => {
    loading.value = true;
    try {
      list.value = await upsApi.getAllAdmin();
    } finally {
      loading.value = false;
    }
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
    await fetchUps();
    return created;
  };

  const updateUps = async (id: string, payload: UpsUpdateDto) => {
    const updated = await upsApi.update(id, payload);
    await fetchUps();
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
    fetchUps,
    fetchUpsById,
    createUps,
    updateUps,
    deleteUps,
  };
});
