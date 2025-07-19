<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import {
  BoltIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline';
import { BoltIcon as BoltIconSolid } from '@heroicons/vue/24/solid';
import UpsCard from '../components/UpsCard.vue';
import UpsCreateModal from '../components/UpsCreateModal.vue';
import { useUpsStore } from '../store';
import { useUserPreferencesStore } from '@/features/settings/store';
import { useCompactMode } from '@/features/settings/composables/useCompactMode';
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/vue/24/outline';
import { useAuthStore } from '@/features/auth/store';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const preferencesStore = useUserPreferencesStore();
const { spacingClasses, sizeClasses } = useCompactMode();

const upsStore = useUpsStore();
const { list: upsList, loading, hasMore, totalItems } = storeToRefs(upsStore);
const { fetchUps, loadMore } = upsStore;
const auth = useAuthStore();

const pageSize = 12;
const isLoadingMore = ref(false);
const scrollContainer = ref<HTMLElement>();
const showCreateModal = ref(false);
const searchQuery = ref('');
const selectedRoom = ref('all');
const isListView = ref(preferencesStore.display.defaultUpsView === 'list');
const isRefreshing = ref(false);

const isAdmin = computed(
  () => auth.currentUser?.roles?.some((role) => role.isAdmin) ?? false,
);

const filteredUps = computed(() => {
  let filtered = upsList.value;

  if (searchQuery.value) {
    filtered = filtered.filter(
      (ups) =>
        ups.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        ups.ip.includes(searchQuery.value),
    );
  }

  if (selectedRoom.value !== 'all') {
    filtered = filtered.filter((ups) => ups.roomId === selectedRoom.value);
  }

  return filtered;
});

const upsStats = computed(() => {
  const total = upsList.value.length;
  const withBatteryStatus = upsList.value.filter(
    (ups) => ups.batteryStatus,
  ).length;
  const criticalBatteries = upsList.value.filter(
    (ups) => ups.batteryStatus?.alertLevel === 'critical',
  ).length;
  const lowBatteries = upsList.value.filter(
    (ups) =>
      ups.batteryStatus?.alertLevel === 'low' ||
      ups.batteryStatus?.alertLevel === 'warning',
  ).length;
  const healthyBatteries = upsList.value.filter(
    (ups) => ups.batteryStatus?.alertLevel === 'normal',
  ).length;

  return {
    total,
    healthy: healthyBatteries,
    warning: lowBatteries,
    critical: criticalBatteries,
    monitored: withBatteryStatus,
    avgBatteryTime: (() => {
      const totalRuntime = upsList.value.reduce(
        (acc, ups) => acc + (ups.batteryStatus?.minutesRemaining || 0),
        0,
      );
      return totalRuntime / total || 0;
    })(),
    rooms: [...new Set(upsList.value.map((ups) => ups.roomId))].length,
  };
});

const handleScroll = async () => {
  if (!scrollContainer.value || isLoadingMore.value || !hasMore.value) return;

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
  const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

  if (scrollPercentage > 0.8) {
    isLoadingMore.value = true;
    try {
      await loadMore(pageSize, searchQuery.value);
    } finally {
      isLoadingMore.value = false;
    }
  }
};

const handleCreated = () => {
  showCreateModal.value = false;
  fetchUps(1, pageSize);
};

const refreshBatteryStatus = async () => {
  isRefreshing.value = true;
  try {
    await upsStore.refreshBatteryStatus();
  } finally {
    isRefreshing.value = false;
  }
};

const rooms = computed(() => {
  const uniqueRooms = [...new Set(upsList.value.map((ups) => ups.roomId))];
  return uniqueRooms.map((id) => ({ id, name: `Room ${id}` }));
});

const handleUpsClick = (upsId: string) => {
  router.push(`/ups/${upsId}`);
};

const toggleView = () => {
  isListView.value = !isListView.value;
  const viewMode = isListView.value ? 'list' : 'grid';
  preferencesStore.updateNestedPreference(
    'display',
    'defaultUpsView',
    viewMode,
    { silent: true },
  );
};

onMounted(async () => {
  await fetchUps(1, pageSize);

  if (route.query.create === 'true') {
    showCreateModal.value = true;
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
            <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <BoltIconSolid
                class="h-6 w-6 text-amber-600 dark:text-amber-400"
              />
            </div>
            <div>
              <h1
                :class="[
                  sizeClasses.text.title,
                  'font-bold text-slate-900 dark:text-white',
                ]"
              >
                {{ t('ups.list_title') }}
              </h1>
              <p
                :class="[
                  sizeClasses.text.body,
                  'text-slate-600 dark:text-slate-400',
                ]"
              >
                {{ t('ups.manage_power_infrastructure') }}
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <button
              @click="refreshBatteryStatus"
              :disabled="isRefreshing"
              class="flex items-center px-3 py-2 bg-slate-100 dark:bg-neutral-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-neutral-600 transition-colors shadow-sm"
              :title="t('common.refresh')"
            >
              <ArrowPathIcon
                :class="['h-4 w-4', isRefreshing && 'animate-spin']"
              />
            </button>
            <button
              v-if="isAdmin"
              @click="showCreateModal = true"
              class="flex items-center px-4 py-2 bg-amber-600 dark:bg-amber-700 text-white rounded-lg hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors shadow-sm"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              {{ t('ups.add_ups') }}
            </button>
          </div>
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
          spacingClasses.margin,
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
                {{ t('ups.stats.total') }}
              </p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ upsStats.total }}
              </p>
            </div>
            <div class="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <BoltIcon class="h-6 w-6 text-amber-600 dark:text-amber-400" />
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
                {{ t('ups.stats.healthy_batteries') }}
              </p>
              <p class="text-2xl font-bold text-emerald-600">
                {{ upsStats.healthy }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {{ t('ups.stats.normal_status') }}
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
                {{ t('ups.stats.critical_batteries') }}
              </p>
              <p class="text-2xl font-bold text-red-600">
                {{ upsStats.critical + upsStats.warning }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {{ t('ups.stats.needs_attention') }}
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
                {{ t('ups.stats.avg_runtime') }}
              </p>
              <p class="text-2xl font-bold text-blue-600">
                {{ upsStats.avgBatteryTime }}m
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {{ t('ups.stats.average_backup_time') }}
              </p>
            </div>
            <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <BoltIcon class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="upsStats.critical > 0 || upsStats.warning > 0"
        :class="[
          'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-800',
          spacingClasses.padding,
          spacingClasses.margin,
          spacingClasses.rounded,
        ]"
      >
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <div class="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
              <ExclamationTriangleIcon
                class="h-6 w-6 text-red-600 dark:text-red-400"
              />
            </div>
          </div>
          <div class="flex-1">
            <h3
              class="text-lg font-semibold text-red-900 dark:text-red-100 mb-2"
            >
              {{ t('ups.battery_alerts.title') }}
            </h3>
            <p class="text-red-700 dark:text-red-200 mb-3">
              {{
                t('ups.battery_alerts.description', {
                  count: upsStats.critical + upsStats.warning,
                })
              }}
            </p>
            <div class="flex flex-wrap gap-2">
              <template v-for="ups in upsList" :key="ups.id">
                <div
                  v-if="
                    ups.batteryStatus &&
                    ['critical', 'low', 'warning'].includes(
                      ups.batteryStatus.alertLevel,
                    )
                  "
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white dark:bg-neutral-800 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700"
                >
                  <div
                    :class="[
                      'w-2 h-2 rounded-full mr-2',
                      ups.batteryStatus.alertLevel === 'critical'
                        ? 'bg-red-600'
                        : 'bg-orange-500',
                    ]"
                  ></div>
                  {{ ups.name }} ({{ ups.batteryStatus.minutesRemaining }}m)
                </div>
              </template>
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
                :placeholder="t('ups.search_placeholder')"
                class="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <div class="flex items-center space-x-2">
              <FunnelIcon class="h-4 w-4 text-slate-500" />
              <select
                v-model="selectedRoom"
                class="border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">{{ t('ups.all_rooms') }}</option>
                <option v-for="room in rooms" :key="room.id" :value="room.id">
                  {{ room.name }}
                </option>
              </select>
            </div>

            <div
              class="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-neutral-700 px-3 py-2 rounded-lg"
            >
              {{ filteredUps.length }} {{ t('ups.results') }}
            </div>

            <button
              @click="toggleView"
              class="flex items-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-600 transition-colors"
              :title="
                isListView ? t('servers.grid_view') : t('servers.list_view')
              "
            >
              <component
                :is="isListView ? Squares2X2Icon : ListBulletIcon"
                class="h-4 w-4"
              />
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="loading && upsList.length === 0"
        class="flex items-center justify-center py-20"
      >
        <div class="text-center space-y-4">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"
          ></div>
          <p class="text-slate-600 dark:text-slate-400">
            {{ t('ups.loading') }}
          </p>
        </div>
      </div>

      <div v-else-if="filteredUps.length" class="space-y-6">
        <div
          v-if="!isListView"
          ref="scrollContainer"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div
            v-for="ups in filteredUps"
            :key="ups.id"
            @click="handleUpsClick(ups.id)"
            class="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
          >
            <UpsCard :ups="ups" :serverCount="ups.serverCount" />
          </div>
        </div>

        <div v-else ref="scrollContainer" class="space-y-2">
          <div
            v-for="ups in filteredUps"
            :key="ups.id"
            @click="handleUpsClick(ups.id)"
            class="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div :class="['w-2 h-2 rounded-full', 'bg-emerald-500']" />
                <div>
                  <h3 class="font-medium text-slate-900 dark:text-white">
                    {{ ups.name }}
                  </h3>
                  <p class="text-sm text-slate-600 dark:text-slate-400">
                    {{ ups.ip }}
                  </p>
                </div>
              </div>
              <div class="text-sm text-slate-600 dark:text-slate-400">
                {{ ups.serverCount || 0 }} {{ t('ups.servers_connected') }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="isLoadingMore" class="flex items-center justify-center py-8">
          <div class="text-center space-y-4">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"
            ></div>
            <p class="text-slate-600 dark:text-slate-400 text-sm">
              {{ t('ups.loading_more') }}
            </p>
          </div>
        </div>

        <div v-else-if="hasMore" class="flex items-center justify-center py-8">
          <button
            @click="() => loadMore(pageSize, searchQuery)"
            class="px-6 py-3 bg-white dark:bg-neutral-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors shadow-sm text-slate-700 dark:text-slate-300 font-medium"
          >
            {{ t('ups.load_more') }}
          </button>
        </div>

        <div v-else-if="totalItems > 12" class="text-center py-8">
          <p class="text-slate-500 dark:text-slate-400 text-sm">
            {{ t('ups.all_loaded', { count: totalItems }) }}
          </p>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <div
          :class="[
            'bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 p-12',
            spacingClasses.rounded,
          ]"
        >
          <BoltIcon
            class="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4"
          />
          <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">
            {{ searchQuery ? t('ups.no_results') : t('ups.no_ups_found') }}
          </h3>
          <p class="text-slate-500 dark:text-slate-400 mb-6">
            {{
              searchQuery
                ? t('ups.try_different_search')
                : t('ups.add_first_ups')
            }}
          </p>
          <button
            v-if="!searchQuery"
            @click="showCreateModal = true"
            class="inline-flex items-center px-4 py-2 bg-amber-600 dark:bg-amber-700 text-white rounded-lg hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            {{ t('ups.add_ups') }}
          </button>
        </div>
      </div>
    </div>

    <UpsCreateModal
      :is-open="showCreateModal"
      @close="showCreateModal = false"
      @created="handleCreated"
    />
  </div>
</template>
