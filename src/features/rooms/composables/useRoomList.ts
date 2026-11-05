import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useRoomStore } from '../store';
import { useRoomEnvironments } from './useRoomEnvironments';
import { useUserPreferencesStore } from '@/features/settings/store';
import { useToast } from '@/shared/composables/useToast';
import type { Room } from '../types';

const PAGE_SIZE = 12;

export const useRoomList = () => {
  const { t } = useI18n();
  const toast = useToast();
  const route = useRoute();
  const router = useRouter();
  const store = useRoomStore();
  const preferences = useUserPreferencesStore();
  const environments = useRoomEnvironments();
  const { list: rooms, loading, hasMore } = storeToRefs(store);

  const query = ref('');
  const creating = ref(false);
  const toDelete = ref<Room | null>(null);
  const viewMode = ref<'grid' | 'list'>(
    preferences.display.defaultRoomView === 'list' ? 'list' : 'grid',
  );

  const visible = computed(() =>
    rooms.value.filter((room) =>
      room.name.toLowerCase().includes(query.value.trim().toLowerCase()),
    ),
  );

  watch(
    () => rooms.value.map((room) => room.id),
    (ids) =>
      environments.loadMany(
        ids.filter((id) => !(id in environments.entries.value)),
      ),
  );

  onMounted(async () => {
    await store.fetchRooms(true, 1, PAGE_SIZE);
    if (route.query.create === 'true') {
      creating.value = true;
      router.replace({ query: {} });
    }
  });

  const setViewMode = (mode: 'grid' | 'list') => {
    viewMode.value = mode;
    preferences.updateNestedPreference('display', 'defaultRoomView', mode, {
      silent: true,
    });
  };

  const onCreated = () => {
    creating.value = false;
    store.fetchRooms(true, 1, PAGE_SIZE);
  };

  const confirmDelete = async () => {
    if (!toDelete.value) return;
    try {
      await store.deleteRoom(toDelete.value.id);
      toast.showSuccess(t('roomsPage.delete_confirm.done'));
    } catch {
      toast.showError(t('roomsPage.delete_confirm.failed'));
    } finally {
      toDelete.value = null;
    }
  };

  return {
    rooms,
    visible,
    loading,
    hasMore,
    query,
    creating,
    toDelete,
    viewMode,
    environments,
    canDelete: store.canDeleteRoom,
    setViewMode,
    onCreated,
    confirmDelete,
    loadMore: () => store.loadMore(true, PAGE_SIZE),
  };
};
