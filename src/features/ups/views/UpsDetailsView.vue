<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import {
  ArrowLeftIcon,
  BoltIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  ChartBarIcon,
  ClockIcon,
  MapPinIcon,
  ServerIcon,
  CpuChipIcon,
  Battery0Icon,
  PowerIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline';
import {
  ShieldCheckIcon as ShieldCheckIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  BoltIcon as BoltIconSolid,
} from '@heroicons/vue/24/solid';
import { useUpsStore } from '../store';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const upsId = route.params.id as string;
const upsStore = useUpsStore();
const { current: ups, loading } = storeToRefs(upsStore);
const { fetchUpsById } = upsStore;

const showEditModal = ref(false);
const activeTab = ref<'overview' | 'monitoring' | 'servers' | 'history'>(
  'overview',
);
const isPerformingTest = ref(false);

// TODO: Replace with API data
const upsMetrics = ref({
  status: 'online',
  load: 45,
  batteryLevel: 85,
  inputVoltage: 230.5,
  outputVoltage: 229.8,
  frequency: 50.0,
  temperature: 24.5,
  estimatedRuntime: 38,
  lastSelfTest: new Date(Date.now() - 86400000 * 7).toLocaleDateString(),
  nextSelfTest: new Date(Date.now() + 86400000 * 7).toLocaleDateString(),
});

// TODO: Replace with API data
const connectedServers = ref([
  {
    id: 'srv-1',
    name: 'Web Server 01',
    ip: '192.168.1.10',
    powerConsumption: 120,
    status: 'active',
  },
  {
    id: 'srv-2',
    name: 'Database Server',
    ip: '192.168.1.11',
    powerConsumption: 180,
    status: 'active',
  },
  {
    id: 'srv-3',
    name: 'Storage Server',
    ip: '192.168.1.12',
    powerConsumption: 95,
    status: 'active',
  },
]);

const timeline = ref([
  {
    id: 1,
    time: new Date().toLocaleString(),
    message: t('ups.timeline.self_test_completed'),
    type: 'success',
    icon: ShieldCheckIconSolid,
  },
  {
    id: 2,
    time: new Date(Date.now() - 86400000).toLocaleString(),
    message: t('ups.timeline.load_increased'),
    type: 'info',
    icon: BoltIconSolid,
  },
  {
    id: 3,
    time: new Date(Date.now() - 172800000).toLocaleString(),
    message: t('ups.timeline.battery_test'),
    type: 'warning',
    icon: ExclamationTriangleIconSolid,
  },
]);

const serverStats = computed(() => ({
  total: connectedServers.value.length,
  active: connectedServers.value.filter((s) => s.status === 'active').length,
  totalPower: connectedServers.value.reduce(
    (sum, s) => sum + s.powerConsumption,
    0,
  ),
}));

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
    case 'active':
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
    case 'offline':
    case 'inactive':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    case 'warning':
      return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700';
  }
};

const handleSelfTest = async () => {
  isPerformingTest.value = true;

  // TODO: remove this mock delay and replace with actual API call
  await new Promise((resolve) => setTimeout(resolve, 3000));

  timeline.value.unshift({
    id: Date.now(),
    time: new Date().toLocaleString(),
    message: t('ups.timeline.self_test_initiated'),
    type: 'info',
    icon: BoltIconSolid,
  });

  isPerformingTest.value = false;
};

const navigateToServer = (serverId: string) => {
  router.push(`/servers/${serverId}`);
};

onMounted(() => {
  fetchUpsById(upsId);

  // TODO: Remove this mock data and replace with actual API calls
  const interval = setInterval(() => {
    upsMetrics.value.load = Math.max(
      20,
      Math.min(80, upsMetrics.value.load + (Math.random() - 0.5) * 10),
    );
    upsMetrics.value.batteryLevel = Math.max(
      70,
      Math.min(100, upsMetrics.value.batteryLevel + (Math.random() - 0.5) * 5),
    );
    upsMetrics.value.inputVoltage = 230 + (Math.random() - 0.5) * 10;
    upsMetrics.value.outputVoltage = 230 + (Math.random() - 0.5) * 5;
    upsMetrics.value.temperature = 24 + Math.random() * 4;
  }, 5000);

  return () => clearInterval(interval);
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-800">
    <div class="bg-white dark:bg-neutral-800 border-b border-slate-200 dark:border-neutral-700 shadow-sm sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="router.back()"
              class="flex items-center px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-lg transition-all duration-200"
            >
              <ArrowLeftIcon class="h-4 w-4 mr-2" />
              {{ t('common.back') }}
            </button>

            <div class="flex items-center space-x-3" v-if="ups">
              <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <BoltIcon class="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
                  {{ ups.name }}
                </h1>
                <p class="text-sm text-slate-600 dark:text-slate-400">
                  {{ ups.ip }} • UPS ID: {{ ups.id }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-2" v-if="ups">
            <span
              :class="[
                'px-3 py-1 text-xs font-semibold rounded-full border flex items-center space-x-1',
                getStatusColor(upsMetrics.status),
              ]"
            >
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  upsMetrics.status === 'online'
                    ? 'bg-emerald-500'
                    : 'bg-red-500',
                ]"
              ></div>
              <span>{{
                upsMetrics.status === 'online'
                  ? t('ups.online')
                  : t('ups.offline')
              }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center space-y-4">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"
        ></div>
        <p class="text-slate-600 dark:text-slate-400">{{ t('ups.loading') }}</p>
      </div>
    </div>

    <div v-else-if="ups" class="max-w-7xl mx-auto px-6 py-8">
      <div
        class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-700 p-6 mb-8"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap gap-3">
            <button
              @click="handleSelfTest"
              :disabled="isPerformingTest"
              class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <WrenchScrewdriverIcon class="h-4 w-4 mr-2" />
              {{ t('ups.self_test') }}
            </button>

            <button
              class="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <ShieldCheckIcon class="h-4 w-4 mr-2" />
              {{ t('ups.test_battery') }}
            </button>

            <button
              class="flex items-center px-4 py-2 bg-slate-600 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
            >
              <PowerIcon class="h-4 w-4 mr-2" />
              {{ t('ups.check_status') }}
            </button>
          </div>

          <button
            @click="showEditModal = true"
            class="flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors"
          >
            <PencilIcon class="h-4 w-4 mr-2" />
            {{ t('ups.edit') }}
          </button>
        </div>

        <div
          v-if="isPerformingTest"
          class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <div class="flex items-center space-x-3">
            <div
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"
            ></div>
            <span class="text-sm text-blue-800 dark:text-blue-400">{{
              t('ups.test_in_progress')
            }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-700 mb-8">
        <div class="border-b border-slate-200 dark:border-neutral-700">
          <nav class="flex space-x-8 px-6" aria-label="Tabs">
            <button
              v-for="tab in [
                {
                  key: 'overview',
                  label: t('ups.tabs.overview'),
                  icon: BoltIcon,
                },
                {
                  key: 'monitoring',
                  label: t('ups.tabs.monitoring'),
                  icon: ChartBarIcon,
                },
                {
                  key: 'servers',
                  label: t('ups.tabs.connected_servers'),
                  icon: ServerIcon,
                },
                {
                  key: 'history',
                  label: t('ups.tabs.history'),
                  icon: ClockIcon,
                },
              ]"
              :key="tab.key"
              @click="activeTab = tab.key as any"
              :class="[
                'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.key
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600',
              ]"
            >
              <component :is="tab.icon" class="h-4 w-4" />
              <span>{{ tab.label }}</span>
            </button>
          </nav>
        </div>

        <div class="p-6">
          <div v-if="activeTab === 'overview'" class="space-y-8">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div
                class="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-amber-800 dark:text-amber-400">
                      {{ t('ups.load') }}
                    </p>
                    <p class="text-2xl font-bold text-amber-900 dark:text-amber-300">
                      {{ upsMetrics.load }}%
                    </p>
                  </div>
                  <CpuChipIcon class="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div class="mt-2 bg-amber-200 dark:bg-amber-900/50 rounded-full h-2">
                  <div
                    class="bg-amber-600 dark:bg-amber-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${upsMetrics.load}%` }"
                  ></div>
                </div>
              </div>

              <div
                class="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-emerald-800 dark:text-emerald-400">
                      {{ t('ups.battery') }}
                    </p>
                    <p class="text-2xl font-bold text-emerald-900 dark:text-emerald-300">
                      {{ upsMetrics.batteryLevel }}%
                    </p>
                  </div>
                  <Battery0Icon class="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div class="mt-2 bg-emerald-200 dark:bg-emerald-900/50 rounded-full h-2">
                  <div
                    class="bg-emerald-600 dark:bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${upsMetrics.batteryLevel}%` }"
                  ></div>
                </div>
              </div>

              <div
                class="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-blue-800 dark:text-blue-400">
                      {{ t('ups.runtime') }}
                    </p>
                    <p class="text-2xl font-bold text-blue-900 dark:text-blue-300">
                      {{ upsMetrics.estimatedRuntime }}min
                    </p>
                  </div>
                  <ClockIcon class="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <div
                class="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-purple-800 dark:text-purple-400">
                      {{ t('ups.temperature') }}
                    </p>
                    <p class="text-2xl font-bold text-purple-900 dark:text-purple-300">
                      {{ upsMetrics.temperature.toFixed(1) }}°C
                    </p>
                  </div>
                  <ExclamationTriangleIcon class="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div class="space-y-6">
                <h3
                  class="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2"
                >
                  <PowerIcon class="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span>{{ t('ups.power_specifications') }}</span>
                </h3>

                <div class="bg-slate-50 dark:bg-neutral-700 rounded-xl p-4 space-y-3">
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div class="space-y-2">
                      <p>
                        <span class="font-medium text-slate-600"
                          >{{ t('ups.input_voltage') }}:</span
                        >
                        <span class="text-slate-900"
                          >{{ upsMetrics.inputVoltage.toFixed(1) }}V</span
                        >
                      </p>
                      <p>
                        <span class="font-medium text-slate-600"
                          >{{ t('ups.output_voltage') }}:</span
                        >
                        <span class="text-slate-900"
                          >{{ upsMetrics.outputVoltage.toFixed(1) }}V</span
                        >
                      </p>
                      <p>
                        <span class="font-medium text-slate-600"
                          >{{ t('ups.frequency') }}:</span
                        >
                        <span class="text-slate-900"
                          >{{ upsMetrics.frequency.toFixed(1) }}Hz</span
                        >
                      </p>
                    </div>
                    <div class="space-y-2">
                      <p>
                        <span class="font-medium text-slate-600"
                          >{{ t('ups.grace_on') }}:</span
                        >
                        <span class="text-slate-900"
                          >{{ ups.grace_period_on }}s</span
                        >
                      </p>
                      <p>
                        <span class="font-medium text-slate-600"
                          >{{ t('ups.grace_off') }}:</span
                        >
                        <span class="text-slate-900"
                          >{{ ups.grace_period_off }}s</span
                        >
                      </p>
                      <p>
                        <span class="font-medium text-slate-600"
                          >{{ t('ups.total_load') }}:</span
                        >
                        <span class="text-slate-900"
                          >{{ serverStats.totalPower }}W</span
                        >
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <h3
                  class="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2"
                >
                  <MapPinIcon class="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{{ t('ups.maintenance_info') }}</span>
                </h3>

                <div class="bg-slate-50 dark:bg-neutral-700 rounded-xl p-4 space-y-3">
                  <div class="space-y-2 text-sm">
                    <p>
                      <span class="font-medium text-slate-600"
                        >{{ t('ups.room') }}:</span
                      >
                      <router-link
                        :to="`/rooms/${ups.roomId}`"
                        class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline ml-1"
                      >
                        {{ ups.roomId }}
                      </router-link>
                    </p>
                    <p>
                      <span class="font-medium text-slate-600"
                        >{{ t('ups.last_self_test') }}:</span
                      >
                      <span class="text-slate-900">{{
                        upsMetrics.lastSelfTest
                      }}</span>
                    </p>
                    <p>
                      <span class="font-medium text-slate-600"
                        >{{ t('ups.next_self_test') }}:</span
                      >
                      <span class="text-slate-900">{{
                        upsMetrics.nextSelfTest
                      }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'monitoring'" class="space-y-6">
            <div class="text-center py-20">
              <ChartBarIcon class="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
              <p class="text-slate-600 dark:text-slate-400 text-lg">
                {{ t('ups.monitoring_placeholder') }}
              </p>
              <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">
                {{ t('ups.monitoring_coming_soon') }}
              </p>
            </div>
          </div>

          <div v-else-if="activeTab === 'servers'" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div class="bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 rounded-xl p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {{ t('ups.total_servers') }}
                    </p>
                    <p class="text-2xl font-bold text-slate-900 dark:text-white">
                      {{ serverStats.total }}
                    </p>
                  </div>
                  <ServerIcon class="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div class="bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 rounded-xl p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {{ t('ups.active_servers') }}
                    </p>
                    <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {{ serverStats.active }}
                    </p>
                  </div>
                  <ShieldCheckIcon class="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>

              <div class="bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 rounded-xl p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {{ t('ups.total_power') }}
                    </p>
                    <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {{ serverStats.totalPower }}W
                    </p>
                  </div>
                  <PowerIcon class="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                {{ t('ups.connected_servers') }}
              </h3>

              <div class="grid grid-cols-1 gap-4">
                <div
                  v-for="server in connectedServers"
                  :key="server.id"
                  @click="navigateToServer(server.id)"
                  class="bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <ServerIcon class="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 class="text-lg font-semibold text-slate-900 dark:text-white">
                          {{ server.name }}
                        </h4>
                        <p class="text-sm text-slate-600 dark:text-slate-400">{{ server.ip }}</p>
                      </div>
                    </div>

                    <div class="flex items-center space-x-4">
                      <div class="text-center">
                        <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {{ t('ups.power_consumption') }}
                        </p>
                        <p class="text-lg font-bold text-amber-600 dark:text-amber-400">
                          {{ server.powerConsumption }}W
                        </p>
                      </div>

                      <span
                        :class="[
                          'px-3 py-1 text-xs font-semibold rounded-full border',
                          getStatusColor(server.status),
                        ]"
                      >
                        {{
                          server.status === 'active'
                            ? t('ups.active')
                            : t('ups.inactive')
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'history'" class="space-y-6">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
              {{ t('ups.history') }}
            </h3>

            <div class="space-y-4">
              <div
                v-for="item in timeline"
                :key="item.id"
                class="flex items-start space-x-4 p-4 bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 rounded-xl"
              >
                <div
                  :class="[
                    'p-2 rounded-lg',
                    item.type === 'success'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      : item.type === 'warning'
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                        : item.type === 'error'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                  ]"
                >
                  <component :is="item.icon" class="h-4 w-4" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-slate-900 dark:text-white">
                    {{ item.message }}
                  </p>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ item.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showEditModal && ups"
      class="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white dark:bg-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div
          class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-neutral-700"
        >
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">
            {{ t('ups.edit_title') }}
          </h2>
          <button
            @click="showEditModal = false"
            class="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-700"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>

        <form class="p-6 space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{
                t('ups.name')
              }}</label>
              <input
                v-model="ups.name"
                type="text"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{
                t('ups.ip')
              }}</label>
              <input
                v-model="ups.ip"
                type="text"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{
                t('ups.grace_on')
              }}</label>
              <input
                v-model.number="ups.grace_period_on"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{{
                t('ups.grace_off')
              }}</label>
              <input
                v-model.number="ups.grace_period_off"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-neutral-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div
            class="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-neutral-700"
          >
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-700"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 bg-amber-600 dark:bg-amber-700 text-white rounded-lg hover:bg-amber-700 dark:hover:bg-amber-600"
            >
              {{ t('ups.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
