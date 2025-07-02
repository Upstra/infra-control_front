<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
} from '@heroicons/vue/24/outline';
import RoomCard from '../components/RoomCard.vue';
import RoomCreateModal from '../components/RoomCreateModal.vue';
import { useRoomStore } from '../store';

const roomStore = useRoomStore();
const { list: rooms, loading, hasMore, totalItems } = storeToRefs(roomStore);
const { fetchRooms, loadMore } = roomStore;
const pageSize = 10;
const isLoadingMore = ref(false);
const scrollContainer = ref<HTMLElement>();

const showCreateModal = ref(false);
const { t } = useI18n();

const searchQuery = ref('');
const viewMode = ref<'grid' | 'list'>('grid');

const filteredRooms = computed(() => {
  return rooms.value.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

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
    // Pour la recherche, on utilise le filtrage côté client pour l'instant
    return;
  } else {
    // Recharger les données si la recherche est vidée
    await fetchRooms(true, 1, pageSize);
  }
};

const handleCreated = () => {
  showCreateModal.value = false;
  fetchRooms(true, 1, pageSize);
};

onMounted(async () => {
  await fetchRooms(true, 1, pageSize);
  await nextTick();
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', handleScroll);
  }
});

watch(searchQuery, handleSearch);
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div class="bg-white border-b border-slate-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-blue-500 rounded-xl">
              <BuildingOffice2Icon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1
                class="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent"
              >
                {{ t('rooms.list_title') }}
              </h1>
              <p class="text-slate-600 mt-1">{{ t('rooms.subtitle') }}</p>
            </div>
          </div>

          <button
            @click="showCreateModal = true"
            class="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-200 transform hover:-translate-y-0.5"
          >
            <PlusIcon
              class="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200"
            />
            {{ t('rooms.add_room') }}
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div
            class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200"
          >
            <div class="text-2xl font-bold text-blue-700">{{ totalItems }}</div>
            <div class="text-sm text-blue-600">
              {{ t('rooms.total_rooms') }}
            </div>
          </div>
          <div
            class="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200"
          >
            <div class="text-2xl font-bold text-green-700">
              {{ filteredRooms.length }}
            </div>
            <div class="text-sm text-green-600">
              {{ t('rooms.active_spaces') }}
            </div>
          </div>
          <div
            class="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200"
          >
            <div class="text-2xl font-bold text-purple-700">
              {{ Math.ceil(totalItems / 3) }}
            </div>
            <div class="text-sm text-purple-600">
              {{ t('rooms.avg_per_floor') }}
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 items-center">
          <div class="relative flex-1 max-w-md">
            <MagnifyingGlassIcon
              class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('rooms.search_placeholder')"
              class="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
            />
          </div>

          <div class="flex items-center space-x-2 bg-slate-100 rounded-xl p-1">
            <button
              @click="viewMode = 'grid'"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-600 hover:text-slate-900',
              ]"
            >
              {{ t('rooms.grid_view') }}
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-600 hover:text-slate-900',
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
      class="max-w-7xl mx-auto px-6 py-8 max-h-screen overflow-y-auto"
    >
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center space-y-4">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
          ></div>
          <p class="text-slate-600">{{ t('rooms.loading') }}</p>
        </div>
      </div>

      <div v-else-if="!filteredRooms.length" class="text-center py-20">
        <div class="space-y-6">
          <div
            class="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center"
          >
            <BuildingOffice2Icon class="h-12 w-12 text-slate-400" />
          </div>
          <div>
            <h3 class="text-xl font-semibold text-slate-900 mb-2">
              {{ t('rooms.no_rooms') }}
            </h3>
            <p class="text-slate-600 mb-6">
              {{ t('rooms.get_started_message') }}
            </p>
            <button
              @click="showCreateModal = true"
              class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
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
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4',
          ]"
        >
          <RoomCard
            v-for="room in filteredRooms"
            :key="room.id"
            :room="room"
            :view-mode="viewMode"
          />
        </div>

        <div
          v-if="isLoadingMore || hasMore"
          class="flex items-center justify-center mt-8 py-6"
        >
          <div
            v-if="isLoadingMore"
            class="flex items-center space-x-2 text-slate-600"
          >
            <div
              class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"
            ></div>
            <span class="text-sm">{{ t('rooms.loading_more') }}</span>
          </div>
          <div v-else-if="hasMore" class="text-sm text-slate-500">
            {{ t('rooms.scroll_for_more') }}
          </div>
        </div>

        <div v-if="!hasMore && rooms.length > 0" class="text-center py-6">
          <p class="text-sm text-slate-500">{{ t('rooms.all_loaded') }}</p>
        </div>
      </div>
    </div>

    <RoomCreateModal
      :is-open="showCreateModal"
      @close="showCreateModal = false"
      @created="handleCreated"
    />
  </div>
</template>
