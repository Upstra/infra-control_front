import { defineStore } from 'pinia';
import { ref } from 'vue';
import { roomApi } from './api';
import type {
  RoomResponseDto,
  RoomCreationDto,
  RoomListResponse,
} from './types';
import { useAuthStore } from '@/features/auth/store';

export const useRoomStore = defineStore('rooms', () => {
  const list = ref<RoomResponseDto[]>([]);
  const current = ref<RoomResponseDto | null>(null);
  const loading = ref(false);
  const totalItems = ref(0);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const hasMore = ref(true);

  const fetchRooms = async (
    includeCounts = false,
    page = 1,
    limit = 10,
    append = false,
  ) => {
    loading.value = true;
    try {
      const response: RoomListResponse = await roomApi.fetchRooms(
        includeCounts,
        page,
        limit,
      );

      if (append) {
        list.value = [...list.value, ...response.items];
      } else {
        list.value = response.items;
      }

      totalItems.value = response.totalItems;
      currentPage.value = response.currentPage;
      totalPages.value = response.totalPages;
      hasMore.value = response.currentPage < response.totalPages;
    } finally {
      loading.value = false;
    }
  };

  const fetchRoomById = async (id: string) => {
    loading.value = true;
    try {
      current.value = await roomApi.fetchRoomById(id);
      return current.value;
    } finally {
      loading.value = false;
    }
  };

  const loadMore = async (includeCounts = false, limit = 10) => {
    if (!hasMore.value || loading.value) return;
    await fetchRooms(includeCounts, currentPage.value + 1, limit, true);
  };

  const createRoom = async (payload: RoomCreationDto) => {
    const created = await roomApi.createRoom(payload);
    await fetchRooms(true, 1, 10);
    return created;
  };

  const updateRoom = async (id: string, payload: RoomCreationDto) => {
    const updated = await roomApi.updateRoom(id, payload);
    await fetchRooms(true, 1, 10);
    return updated;
  };

  const canDeleteRoom = () => {
    const authStore = useAuthStore();
    return authStore.currentUser?.roles?.some((role) => role.isAdmin) || false;
  };

  const deleteRoom = async (id: string) => {
    await roomApi.deleteRoom(id);
    list.value = list.value.filter((r) => r.id !== id);
  };

  return {
    list,
    current,
    loading,
    totalItems,
    currentPage,
    totalPages,
    hasMore,
    fetchRooms,
    loadMore,
    fetchRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    canDeleteRoom,
  };
});
