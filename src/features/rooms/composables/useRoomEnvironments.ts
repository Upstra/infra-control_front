import { ref } from 'vue';
import { roomApi } from '../api';
import type { RoomEnvironment } from '../types';

export type EnvironmentEntry = RoomEnvironment | 'missing';

const entries = ref<Record<string, EnvironmentEntry>>({});

export const useRoomEnvironments = () => {
  const load = async (roomId: string) => {
    let entry: EnvironmentEntry;
    try {
      entry = await roomApi.fetchEnvironment(roomId);
    } catch {
      entry = 'missing';
    }
    entries.value = { ...entries.value, [roomId]: entry };
  };

  const loadMany = (roomIds: string[]) => Promise.all(roomIds.map(load));

  const of = (roomId: string): RoomEnvironment | null => {
    const entry = entries.value[roomId];
    return entry && entry !== 'missing' ? entry : null;
  };

  return { entries, load, loadMany, of };
};
