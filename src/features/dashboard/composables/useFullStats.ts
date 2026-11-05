import { onMounted, ref } from 'vue';
import { dashboardApi } from '../api';
import { roomApi } from '@/features/rooms/api';
import type { FullDashboardStatsDto } from '../types';
import type { RoomResponseDto } from '@/features/rooms/types';

export const useFullStats = () => {
  const stats = ref<FullDashboardStatsDto | null>(null);
  const room = ref<RoomResponseDto | null>(null);
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref<string | null>(null);

  const load = async () => {
    loading.value = true;
    try {
      stats.value = await dashboardApi.getFullStats();
      const roomId = stats.value.maxInletRoomId;
      room.value = roomId
        ? await roomApi.fetchRoomById(roomId).catch(() => null)
        : null;
      loaded.value = true;
      error.value = null;
    } catch (e: any) {
      error.value = e?.message ?? 'stats';
    } finally {
      loading.value = false;
    }
  };

  onMounted(load);

  return { stats, room, loading, loaded, error, load };
};
