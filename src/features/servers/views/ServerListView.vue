<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import {
  ServerIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline';
import { ServerIcon as ServerIconSolid } from '@heroicons/vue/24/solid';
import { fetchServers, getMockServerListResponse } from '../api';
import type { Server, ServerListResponse } from '../types';
import ServerCard from '../components/ServerCard.vue';
import ServerCreateModal from '../components/ServerCreateModal.vue';

const router = useRouter();
const { t } = useI18n();

const servers = ref<Server[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const error = ref('');
const showCreateModal = ref(false);
const searchQuery = ref('');
const selectedState = ref<'all' | 'active' | 'inactive'>('all');
const selectedRoom = ref('all');
const selectedType = ref<'all' | 'physical' | 'virtual'>('all');

const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const hasMore = computed(() => currentPage.value < totalPages.value);
const scrollContainer = ref<HTMLElement | null>(null);

const filteredServers = computed(() => {
  let filtered = servers.value;

  if (searchQuery.value) {
    filtered = filtered.filter(
      (server) =>
        server.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        server.ip.includes(searchQuery.value),
    );
  }

  if (selectedState.value !== 'all') {
    filtered = filtered.filter(
      (server) => server.state === selectedState.value,
    );
  }

  if (selectedRoom.value !== 'all') {
    filtered = filtered.filter(
      (server) => server.roomId === selectedRoom.value,
    );
  }

  if (selectedType.value !== 'all') {
    filtered = filtered.filter((server) => server.type === selectedType.value);
  }

  return filtered;
});

const serverStats = computed(() => ({
  total: servers.value.length,
  active: servers.value.filter((s) => s.state === 'active').length,
  inactive: servers.value.filter((s) => s.state === 'inactive').length,
  physical: servers.value.filter((s) => s.type === 'physical').length,
  virtual: servers.value.filter((s) => s.type === 'virtual').length,
  rooms: Array.from(new Set(servers.value.map((s) => s.roomId))).length,
}));

const rooms = computed(() => {
  const uniqueRooms = Array.from(
    new Set(servers.value.map((server) => server.roomId)),
  );
  return uniqueRooms.map((id) => ({ id, name: `Room ${id}` }));
});

const loadServers = async (page: number = 1, append: boolean = false) => {
  if (page === 1) {
    loading.value = true;
    currentPage.value = 1;
    servers.value = [];
  } else {
    loadingMore.value = true;
  }

  error.value = '';

  try {
    const res = await fetchServers({ page, limit: 12 });
    const response: ServerListResponse = res.data;

    if (append && page > 1) {
      servers.value = [...servers.value, ...response.items];
    } else {
      servers.value = response.items;
    }

    currentPage.value = response.currentPage;
    totalPages.value = response.totalPages;
    totalItems.value = response.totalItems;
  } catch (err: any) {
    console.warn('API call failed, using mock data:', err);
    error.value = t('servers.loading_error');

    const mockResponse = getMockServerListResponse(page, 12);
    if (append && page > 1) {
      servers.value = [...servers.value, ...mockResponse.items];
    } else {
      servers.value = mockResponse.items;
    }

    currentPage.value = mockResponse.currentPage;
    totalPages.value = mockResponse.totalPages;
    totalItems.value = mockResponse.totalItems;
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = async () => {
  if (!hasMore.value || loadingMore.value) return;
  await loadServers(currentPage.value + 1, true);
};

const handleScroll = async () => {
  if (!scrollContainer.value || !hasMore.value || loadingMore.value) return;

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
  const threshold = 200;

  if (scrollTop + clientHeight >= scrollHeight - threshold) {
    await loadMore();
  }
};

const handleCreated = () => {
  showCreateModal.value = false;
  loadServers(1, false);
};

const handleServerClick = (serverId: string) => {
  router.push(`/servers/${serverId}`);
};

onMounted(() => {
  loadServers(1, false);

  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.addEventListener('scroll', handleScroll);
    }
  });
});
</script>

<template>
  <div
    ref="scrollContainer"
    class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-800 overflow-y-auto"
  >
    <div class="bg-white dark:bg-neutral-800 border-b border-slate-200 dark:border-neutral-700 shadow-sm">
      <div class="max-w-7xl mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ServerIconSolid class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ t('servers.list_title') }}
              </h1>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                {{ t('servers.manage_infrastructure') }}
              </p>
            </div>
          </div>

          <button
            @click="showCreateModal = true"
            class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            {{ t('servers.add_server') }}
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                {{ t('servers.stats.total') }}
              </p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ serverStats.total }}
              </p>
            </div>
            <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <ServerIcon class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                {{ t('servers.stats.active') }}
              </p>
              <p class="text-2xl font-bold text-emerald-600">
                {{ serverStats.active }}
              </p>
            </div>
            <div class="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <ShieldCheckIcon class="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                {{ t('servers.stats.inactive') }}
              </p>
              <p class="text-2xl font-bold text-red-600">
                {{ serverStats.inactive }}
              </p>
            </div>
            <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <ExclamationTriangleIcon class="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                {{ t('servers.stats.rooms') }}
              </p>
              <p class="text-2xl font-bold text-purple-600">
                {{ serverStats.rooms }}
              </p>
            </div>
            <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <BuildingOffice2Icon class="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8"
      >
        <div class="flex flex-col lg:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <MagnifyingGlassIcon
                class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400"
              />
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="t('servers.search_placeholder')"
                class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center space-x-2">
              <FunnelIcon class="h-4 w-4 text-slate-500" />
              <select
                v-model="selectedState"
                class="border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{{ t('servers.all_states') }}</option>
                <option value="active">{{ t('servers.active') }}</option>
                <option value="inactive">{{ t('servers.inactive') }}</option>
              </select>
            </div>

            <select
              v-model="selectedType"
              class="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{{ t('servers.all_types') }}</option>
              <option value="physical">{{ t('servers.physical') }}</option>
              <option value="virtual">{{ t('servers.virtual') }}</option>
            </select>

            <select
              v-model="selectedRoom"
              class="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{{ t('servers.all_rooms') }}</option>
              <option v-for="room in rooms" :key="room.id" :value="room.id">
                {{ room.name }}
              </option>
            </select>

            <div
              class="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-neutral-700 px-3 py-2 rounded-lg"
            >
              {{ filteredServers.length }} / {{ totalItems }}
              {{ t('servers.results') }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center space-y-4">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
          ></div>
          <p class="text-slate-600 dark:text-slate-400">{{ t('servers.loading') }}</p>
        </div>
      </div>

      <div v-else-if="error" class="text-center py-20">
        <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p class="text-red-600 text-lg">{{ error }}</p>
      </div>

      <div v-else-if="filteredServers.length" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="server in filteredServers"
            :key="server.id"
            @click="handleServerClick(server.id)"
            class="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
          >
            <ServerCard :server="server" />
          </div>
        </div>

        <div v-if="loadingMore" class="flex items-center justify-center py-8">
          <div class="text-center space-y-4">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
            ></div>
            <p class="text-slate-600 dark:text-slate-400 text-sm">
              {{ t('servers.loading_more') }}
            </p>
          </div>
        </div>

        <div v-else-if="hasMore" class="flex items-center justify-center py-8">
          <button
            @click="loadMore"
            class="px-6 py-3 bg-white dark:bg-neutral-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors shadow-sm text-slate-700 dark:text-slate-300 font-medium"
          >
            {{ t('servers.load_more') }}
          </button>
        </div>

        <div v-else-if="totalItems > 12" class="text-center py-8">
          <p class="text-slate-500 dark:text-slate-400 text-sm">
            {{ t('servers.all_loaded', { count: totalItems }) }}
          </p>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <div class="bg-white dark:bg-neutral-800 rounded-2xl border border-slate-200 dark:border-neutral-700 p-12">
          <ServerIcon class="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">
            {{
              searchQuery
                ? t('servers.no_results')
                : t('servers.no_servers_found')
            }}
          </h3>
          <p class="text-slate-500 dark:text-slate-400 mb-6">
            {{
              searchQuery
                ? t('servers.try_different_search')
                : t('servers.add_first_server')
            }}
          </p>
          <button
            v-if="!searchQuery"
            @click="showCreateModal = true"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            {{ t('servers.add_server') }}
          </button>
        </div>
      </div>
    </div>

    <ServerCreateModal
      :is-open="showCreateModal"
      @close="showCreateModal = false"
      @created="handleCreated"
    />
  </div>
</template>
