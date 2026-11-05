import { computed, ref } from 'vue';
import { roomApi } from '../api';
import type { RoomResponseDto } from '../types';

const ROOM_LIMIT = 100;
const rooms = ref<RoomResponseDto[]>([]);
let pending: Promise<void> | null = null;

const load = (force = false) => {
  if (pending && !force) return pending;
  pending = roomApi
    .fetchRooms(false, 1, ROOM_LIMIT)
    .then((page) => {
      rooms.value = page.items;
    })
    .catch(() => {
      pending = null;
    });
  return pending;
};

export const useRoomOptions = () => {
  load();
  const byId = computed(() =>
    Object.fromEntries(rooms.value.map((room) => [room.id, room])),
  );
  const nameOf = (id: string | null | undefined) =>
    (id && byId.value[id]?.name) || null;
  return { rooms, byId, nameOf, reload: () => load(true) };
};
