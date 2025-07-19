<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import {
  ServerIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  CloudIcon,
} from '@heroicons/vue/24/outline';
import { ServerIcon as ServerIconSolid } from '@heroicons/vue/24/solid';
import { useServerStore } from '../store';
import type { Server } from '../types';
import ServerCard from '../components/ServerCard.vue';
import ServerCreateModal from '../components/ServerCreateModal.vue';
import { useUserPreferencesStore } from '@/features/settings/store';
import { useCompactMode } from '@/features/settings/composables/useCompactMode';
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/vue/24/outline';
import { useRoomStore } from '@/features/rooms/store';
import { useUpsStore } from '@/features/ups/store';
import { useAuthStore } from '@/features/auth/store';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const preferencesStore = useUserPreferencesStore();
const { spacingClasses, sizeClasses } = useCompactMode();

const serverStore = useServerStore();
const roomStore = useRoomStore();
const upsStore = useUpsStore();

const auth = useAuthStore();

const { list: servers, loading, hasMore } = storeToRefs(serverStore);
const { fetchServers, loadMore } = serverStore;
const { list: rooms } = storeToRefs(roomStore);
const { list: upsList } = storeToRefs(upsStore);

const pageSize = 12;
const isLoadingMore = ref(false);
const scrollContainer = ref<HTMLElement>();
const showCreateModal = ref(false);
const searchQuery = ref('');
const selectedState = ref<'all' | 'UP' | 'DOWN'>('all');
const selectedRoom = ref('all');
const selectedType = ref<'all' | 'vcenter' | 'esxi'>('all');
const isListView = ref(preferencesStore.display.defaultServerView === 'list');

const isAdmin = computed(
  () => auth.currentUser?.roles?.some((role) => role.isAdmin) ?? false,
);

const canCreateServers = computed(() => {
  return auth.currentUser?.roles?.some((role) => role.canCreateServer) ?? false;
});

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

const isServerActive = (server: Server) => {
  if (server.metrics?.powerState) {
    return (
      server.metrics.powerState === 'poweredOn' ||
      server.metrics.powerState === 'On'
    );
  }
  return server.state === 'UP';
};

const serverStats = computed(() => ({
  total: servers.value.length,
  active: servers.value.filter((s) => isServerActive(s)).length,
  inactive: servers.value.filter((s) => !isServerActive(s)).length,
  vcenter: servers.value.filter((s) => s.type === 'vcenter').length,
  esxi: servers.value.filter((s) => s.type === 'esxi').length,
  rooms: Array.from(new Set(servers.value.map((s) => s.roomId))).length,
}));

const roomsMap = computed(() => {
  const map = new Map<string, string>();
  rooms.value.forEach((room) => {
    map.set(room.id, room.name);
  });
  return map;
});

const upsMap = computed(() => {
  const map = new Map<string, string>();
  upsList.value.forEach((ups) => {
    map.set(ups.id, ups.name);
  });
  return map;
});

const uniqueRooms = computed(() => {
  const uniqueRoomIds = Array.from(
    new Set(servers.value.map((server) => server.roomId)),
  );
  return uniqueRoomIds.map((id) => ({
    id,
    name: roomsMap.value.get(id) || t('servers.unknown_room'),
  }));
});

const handleScroll = async () => {
  if (!scrollContainer.value || isLoadingMore.value || !hasMore.value) return;

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
  const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

  if (scrollPercentage > 0.8) {
    isLoadingMore.value = true;
    try {
      await loadMore(pageSize);
    } finally {
      isLoadingMore.value = false;
    }
  }
};

const handleCreated = () => {
  showCreateModal.value = false;
  fetchServers(1, pageSize);
};

const handleServerClick = (serverId: string) => {
  router.push(`/servers/${serverId}`);
};

const toggleView = () => {
  isListView.value = !isListView.value;
  const viewMode = isListView.value ? 'list' : 'grid';
  preferencesStore.updateNestedPreference(
    'display',
    'defaultServerView',
    viewMode,
    { silent: true },
  );
};

onMounted(async () => {
  await Promise.all([
    fetchServers(1, pageSize),
    roomStore.fetchRooms(),
    upsStore.fetchUps(1, 100),
  ]);

  // Check if we need to open the create modal
  if (route.query.create === 'true') {
    showCreateModal.value = true;
    // Remove the query parameter from URL
    router.replace({ query: {} });
  }

  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.addEventListener('scroll', handleScroll);
    }
  });
});
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
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ServerIconSolid
                class="h-6 w-6 text-blue-600 dark:text-blue-400"
              />
            </div>
            <div>
              <h1
                :class="[
                  sizeClasses.text.title,
                  'font-bold text-slate-900 dark:text-white',
                ]"
              >
                {{ t('servers.list_title') }}
              </h1>
              <p
                :class="[
                  sizeClasses.text.body,
                  'text-slate-600 dark:text-slate-400',
                ]"
              >
                {{ t('servers.manage_infrastructure') }}
              </p>
            </div>
          </div>
          <button
            v-if="isAdmin || canCreateServers"
            @click="showCreateModal = true"
            :class="[
              'flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800',
              spacingClasses.paddingX,
              spacingClasses.paddingY,
              spacingClasses.rounded,
              sizeClasses.text.body,
              'font-medium shadow-sm transition-all duration-200 hover:shadow-md',
            ]"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            {{ t('servers.add_server') }}
          </button>
        </div>
      </div>
    </div>

    <div
      :class="[
        'max-w-7xl mx-auto',
        spacingClasses.paddingX,
        spacingClasses.paddingY,
      ]"
    >
      <div
        :class="[
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
          spacingClasses.gap,
          'mb-6',
        ]"
      >
        <div
          :class="[
            'bg-white dark:bg-neutral-800 shadow-sm border border-slate-200 dark:border-neutral-700',
            spacingClasses.padding,
            spacingClasses.rounded,
          ]"
        >
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

        <div
          :class="[
            'bg-white dark:bg-neutral-800 shadow-sm border border-slate-200 dark:border-neutral-700',
            spacingClasses.padding,
            spacingClasses.rounded,
          ]"
        >
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
              <ShieldCheckIcon
                class="h-6 w-6 text-emerald-600 dark:text-emerald-400"
              />
            </div>
          </div>
        </div>

        <div
          :class="[
            'bg-white dark:bg-neutral-800 shadow-sm border border-slate-200 dark:border-neutral-700',
            spacingClasses.padding,
            spacingClasses.rounded,
          ]"
        >
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
              <ExclamationTriangleIcon
                class="h-6 w-6 text-red-600 dark:text-red-400"
              />
            </div>
          </div>
        </div>

        <div
          :class="[
            'bg-white dark:bg-neutral-800 shadow-sm border border-slate-200 dark:border-neutral-700',
            spacingClasses.padding,
            spacingClasses.rounded,
          ]"
        >
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
              <BuildingOffice2Icon
                class="h-6 w-6 text-purple-600 dark:text-purple-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        :class="[
          'bg-white shadow-sm border border-slate-200 dark:bg-neutral-800 dark:border-neutral-700',
          spacingClasses.padding,
          spacingClasses.margin,
          spacingClasses.rounded,
        ]"
      >
        <div class="flex flex-col sm:flex-row gap-4">
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

          <div class="flex items-center gap-2">
            <select
              v-model="selectedState"
              class="px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{{ t('servers.all_states') }}</option>
              <option value="UP">{{ t('servers.filter_active') }}</option>
              <option value="DOWN">{{ t('servers.filter_inactive') }}</option>
            </select>

            <select
              v-model="selectedType"
              class="px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{{ t('servers.all_types') }}</option>
              <option value="vcenter">{{ t('servers.vcenter') }}</option>
              <option value="esxi">{{ t('servers.esxi') }}</option>
            </select>

            <select
              v-model="selectedRoom"
              class="px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{{ t('servers.all_rooms') }}</option>
              <option
                v-for="room in uniqueRooms"
                :key="room.id"
                :value="room.id"
              >
                {{ room.name }}
              </option>
            </select>

            <button
              @click="toggleView"
              class="p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-600 transition-colors"
              :title="
                isListView ? t('common.grid_view') : t('common.list_view')
              "
            >
              <component
                :is="isListView ? Squares2X2Icon : ListBulletIcon"
                class="h-5 w-5"
              />
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="filteredServers.length > 0"
        class="flex items-center justify-between mb-4"
      >
        <p class="text-sm text-slate-600 dark:text-slate-400">
          {{ filteredServers.length }} {{ t('servers.results') }}
        </p>
      </div>

      <div
        v-if="loading && servers.length === 0"
        class="flex items-center justify-center py-20"
      >
        <div class="text-center space-y-4">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
          ></div>
          <p class="text-slate-600 dark:text-slate-400">
            {{ t('servers.loading') }}
          </p>
        </div>
      </div>

      <div
        v-else-if="filteredServers.length === 0 && !loading"
        class="text-center py-20"
      >
        <ServerIcon class="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">
          {{
            searchQuery ||
            selectedState !== 'all' ||
            selectedRoom !== 'all' ||
            selectedType !== 'all'
              ? t('servers.no_results')
              : t('servers.no_servers_found')
          }}
        </h3>
        <p class="text-sm text-slate-600 dark:text-slate-400">
          {{
            searchQuery ||
            selectedState !== 'all' ||
            selectedRoom !== 'all' ||
            selectedType !== 'all'
              ? t('servers.try_different_search')
              : t('servers.add_first_server')
          }}
        </p>
      </div>

      <div v-else ref="scrollContainer" class="overflow-auto">
        <div
          v-if="!isListView"
          :class="[
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
            spacingClasses.gap,
          ]"
        >
          <ServerCard
            v-for="server in filteredServers"
            :key="server.id"
            :server="server"
            :room-name="
              roomsMap.get(server.roomId) || t('servers.unknown_room')
            "
            :ups-name="
              server.upsId
                ? upsMap.get(server.upsId) || t('servers.unknown_ups')
                : undefined
            "
            @click="handleServerClick(server.id)"
          />
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="server in filteredServers"
            :key="server.id"
            @click="handleServerClick(server.id)"
            class="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div
                  :class="[
                    'p-2 rounded-lg',
                    server.type === 'vcenter' || server.type === 'esxi'
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-purple-100 dark:bg-purple-900/30',
                  ]"
                >
                  <component
                    :is="server.type === 'vcenter' ? CpuChipIcon : CloudIcon"
                    :class="[
                      'h-5 w-5',
                      server.type === 'vcenter' || server.type === 'esxi'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-purple-600 dark:text-purple-400',
                    ]"
                  />
                </div>
                <div>
                  <h3
                    class="text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    {{ server.name }}
                  </h3>
                  <p class="text-xs text-slate-600 dark:text-slate-400">
                    {{ server.ip }} •
                    {{
                      roomsMap.get(server.roomId) || t('servers.unknown_room')
                    }}
                    <span v-if="server.upsId">
                      •
                      {{ upsMap.get(server.upsId) || t('servers.unknown_ups') }}
                    </span>
                  </p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span
                  v-if="server.type !== 'vcenter'"
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    isServerActive(server)
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
                  ]"
                >
                  {{
                    isServerActive(server)
                      ? t('servers.active')
                      : t('servers.inactive')
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="isLoadingMore"
          class="flex items-center justify-center py-4 mt-4"
        >
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          ></div>
          <span class="ml-3 text-sm text-slate-600 dark:text-slate-400">
            {{ t('servers.loading_more') }}
          </span>
        </div>

        <div
          v-else-if="hasMore && filteredServers.length > 0"
          class="text-center py-4 mt-4"
        >
          <button
            @click="handleScroll"
            class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            {{ t('servers.load_more') }}
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
