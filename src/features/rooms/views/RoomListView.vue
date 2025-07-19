<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
} from '@heroicons/vue/24/outline';
import RoomCard from '../components/RoomCard.vue';
import RoomCreateModal from '../components/RoomCreateModal.vue';
import ConfirmModal from '@/shared/components/ConfirmModal.vue';
import { useToast } from 'vue-toast-notification';
import { useRoomStore } from '../store';
import { useUserPreferencesStore } from '@/features/settings/store';
import { useCompactMode } from '@/features/settings/composables/useCompactMode';
import { useAuthStore } from '@/features/auth/store';

const router = useRouter();
const route = useRoute();
const roomStore = useRoomStore();
const { list: rooms, loading, hasMore, totalItems } = storeToRefs(roomStore);
const { fetchRooms, loadMore, deleteRoom, canDeleteRoom } = roomStore;
const { t } = useI18n();
const preferencesStore = useUserPreferencesStore();
const { spacingClasses, sizeClasses } = useCompactMode();

const auth = useAuthStore();
const toast = useToast();

const pageSize = 10;
const isLoadingMore = ref(false);
const scrollContainer = ref<HTMLElement>();

const showCreateModal = ref(false);
const showDeleteModal = ref(false);
const roomToDelete = ref<any>(null);

const searchQuery = ref('');
const viewMode = ref<'grid' | 'list'>(
  preferencesStore.display.defaultRoomView === 'list' ? 'list' : 'grid',
);

const filteredRooms = computed(() => {
  return rooms.value.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

const isAdmin = computed(
  () => auth.currentUser?.roles?.some((role) => role.isAdmin) ?? false,
);

const handleScroll = async () => {
  if (!scrollContainer.value || isLoadingMore.value || !hasMore.value) return;

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
  const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

  if (scrollPercentage > 0.8) {
    isLoadingMore.value = true;
    try {
      await loadMore(true, pageSize);
    } finally {
      isLoadingMore.value = false;
    }
  }
};

const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    return;
  } else {
    await fetchRooms(true, 1, pageSize);
  }
};

const handleCreated = () => {
  showCreateModal.value = false;
  fetchRooms(true, 1, pageSize);
};

const toggleView = (mode: 'grid' | 'list') => {
  viewMode.value = mode;
  preferencesStore.updateNestedPreference('display', 'defaultRoomView', mode, {
    silent: true,
  });
};

const confirmDeleteRoom = (room: any) => {
  roomToDelete.value = room;
  showDeleteModal.value = true;
};

const handleDeleteRoom = async () => {
  if (!roomToDelete.value) return;

  try {
    await deleteRoom(roomToDelete.value.id);
    toast.success(t('rooms.delete_success'));
    showDeleteModal.value = false;
    roomToDelete.value = null;
  } catch (error: any) {
    toast.error(error.message || t('rooms.delete_error'));
  }
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  roomToDelete.value = null;
};

onMounted(async () => {
  await fetchRooms(true, 1, pageSize);

  if (route.query.create === 'true') {
    showCreateModal.value = true;
    router.replace({ query: {} });
  }

  await nextTick();
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', handleScroll);
  }
});

watch(searchQuery, handleSearch);
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-800"
  >
    <div
      class="bg-white dark:bg-neutral-800 border-b border-slate-200 dark:border-neutral-700 shadow-sm"
    >
      <div
        :class="[
          'max-w-7xl mx-auto',
          spacingClasses.paddingX,
          spacingClasses.paddingY,
        ]"
      >
        <div
          :class="['flex items-center justify-between', spacingClasses.margin]"
        >
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-blue-500 dark:bg-blue-600 rounded-xl">
              <BuildingOffice2Icon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1
                :class="[
                  sizeClasses.text.title,
                  'font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent',
                ]"
              >
                {{ t('rooms.list_title') }}
              </h1>
              <p
                :class="[
                  sizeClasses.text.body,
                  'text-slate-600 dark:text-slate-400 mt-1',
                ]"
              >
                {{ t('rooms.subtitle') }}
              </p>
            </div>
          </div>

          <button
            v-if="isAdmin"
            @click="showCreateModal = true"
            class="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-200 dark:hover:shadow-blue-900/50 transform hover:-translate-y-0.5"
          >
            <PlusIcon
              class="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200"
            />
            {{ t('rooms.add_room') }}
          </button>
        </div>

        <div
          :class="[
            'grid grid-cols-1 sm:grid-cols-3',
            spacingClasses.gap,
            spacingClasses.margin,
          ]"
        >
          <div
            :class="[
              'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800',
              spacingClasses.padding,
              spacingClasses.rounded,
            ]"
          >
            <div class="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {{ totalItems }}
            </div>
            <div class="text-sm text-blue-600 dark:text-blue-400">
              {{ t('rooms.total_rooms') }}
            </div>
          </div>
          <div
            :class="[
              'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800',
              spacingClasses.padding,
              spacingClasses.rounded,
            ]"
          >
            <div class="text-2xl font-bold text-green-700 dark:text-green-400">
              {{ filteredRooms.length }}
            </div>
            <div class="text-sm text-green-600 dark:text-green-400">
              {{ t('rooms.active_spaces') }}
            </div>
          </div>
          <div
            :class="[
              'bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800',
              spacingClasses.padding,
              spacingClasses.rounded,
            ]"
          >
            <div
              class="text-2xl font-bold text-purple-700 dark:text-purple-400"
            >
              {{ Math.ceil(totalItems / 3) }}
            </div>
            <div class="text-sm text-purple-600 dark:text-purple-400">
              {{ t('rooms.avg_per_floor') }}
            </div>
          </div>
        </div>

        <div
          :class="[
            'flex flex-col sm:flex-row items-center',
            spacingClasses.gap,
          ]"
        >
          <div class="relative flex-1 max-w-md">
            <MagnifyingGlassIcon
              class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('rooms.search_placeholder')"
              class="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
            />
          </div>

          <div
            class="flex items-center space-x-2 bg-slate-100 dark:bg-neutral-700 rounded-xl p-1"
          >
            <button
              @click="toggleView('grid')"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-neutral-600 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
              ]"
            >
              {{ t('rooms.grid_view') }}
            </button>
            <button
              @click="toggleView('list')"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                viewMode === 'list'
                  ? 'bg-white dark:bg-neutral-600 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
              ]"
            >
              {{ t('rooms.list_view') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      ref="scrollContainer"
      :class="[
        'max-w-7xl mx-auto max-h-screen overflow-y-auto',
        spacingClasses.paddingX,
        spacingClasses.paddingY,
      ]"
    >
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center space-y-4">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
          ></div>
          <p class="text-slate-600 dark:text-slate-400">
            {{ t('rooms.loading') }}
          </p>
        </div>
      </div>

      <div v-else-if="!filteredRooms.length" class="text-center py-20">
        <div class="space-y-6">
          <div
            class="mx-auto w-24 h-24 bg-slate-100 dark:bg-neutral-700 rounded-full flex items-center justify-center"
          >
            <BuildingOffice2Icon
              class="h-12 w-12 text-slate-400 dark:text-slate-500"
            />
          </div>
          <div>
            <h3
              class="text-xl font-semibold text-slate-900 dark:text-white mb-2"
            >
              {{ t('rooms.no_rooms') }}
            </h3>
            <p class="text-slate-600 dark:text-slate-400 mb-6">
              {{ t('rooms.get_started_message') }}
            </p>
            <button
              @click="showCreateModal = true"
              class="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <PlusIcon class="h-5 w-5 mr-2" />
              {{ t('rooms.create_first_room') }}
            </button>
          </div>
        </div>
      </div>

      <div v-else>
        <div
          :class="[
            viewMode === 'grid'
              ? [
                  'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
                  spacingClasses.gap,
                ]
              : spacingClasses.space,
          ]"
        >
          <RoomCard
            v-for="room in filteredRooms"
            :key="room.id"
            :room="room"
            :view-mode="viewMode"
            :can-delete="canDeleteRoom()"
            @delete="confirmDeleteRoom"
          />
        </div>

        <div
          v-if="isLoadingMore || hasMore"
          class="flex items-center justify-center mt-8 py-6"
        >
          <div
            v-if="isLoadingMore"
            class="flex items-center space-x-2 text-slate-600 dark:text-slate-400"
          >
            <div
              class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"
            ></div>
            <span class="text-sm">{{ t('rooms.loading_more') }}</span>
          </div>
          <div
            v-else-if="hasMore"
            class="text-sm text-slate-500 dark:text-slate-400"
          >
            {{ t('rooms.scroll_for_more') }}
          </div>
        </div>

        <div v-if="!hasMore && rooms.length > 0" class="text-center py-6">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ t('rooms.all_loaded') }}
          </p>
        </div>
      </div>
    </div>

    <RoomCreateModal
      :is-open="showCreateModal"
      @close="showCreateModal = false"
      @created="handleCreated"
    />

    <ConfirmModal
      :open="showDeleteModal"
      :title="t('rooms.delete_confirm_title')"
      :message="t('rooms.delete_confirm_message', { name: roomToDelete?.name })"
      :confirm-text="t('common.delete')"
      :cancel-text="t('common.cancel')"
      variant="danger"
      @confirm="handleDeleteRoom"
      @cancel="cancelDelete"
    />
  </div>
</template>
