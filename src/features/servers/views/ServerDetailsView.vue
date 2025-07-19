<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  ServerIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CubeIcon,
} from '@heroicons/vue/24/outline';
import {
  PlayIcon as PlayIconSolid,
  StopIcon as StopIconSolid,
  ArrowPathIcon as ArrowPathIconSolid,
} from '@heroicons/vue/24/solid';
import type { Server, ServerMetricsDto } from '../types';
import { useServerStore } from '../store';
import ServerHeader from '../components/ServerHeader.vue';
import ServerMetricsCards from '../components/ServerMetricsCards.vue';
import ServerDetailsCard from '../components/ServerDetailsCard.vue';
import ServerInfrastructureLinks from '../components/ServerInfrastructureLinks.vue';
import VirtualMachinesTab from '../components/VirtualMachinesTab.vue';
import ServerHistoryTab from '../components/ServerHistoryTab.vue';
import ServerEditModal from '../components/ServerEditModal.vue';
import { defineAsyncComponent } from 'vue';
const SshTerminal = defineAsyncComponent(
  () => import('../components/SshTerminal.vue'),
);
import SshAuthModal from '../components/SshAuthModal.vue';
import ServerCredentials from '../components/ServerCredentials.vue';
import { useToast } from 'vue-toast-notification';
import { useRoomStore } from '@/features/rooms/store';
import { useUpsStore } from '@/features/ups/store';
import { useGroupStore } from '@/features/groups/store';
import api from '@/services/api';
import { fetchVms } from '@/features/vms/api';
import type { Vm } from '@/features/vms/types';

const route = useRoute();
const { t } = useI18n();
const toast = useToast();
const serverStore = useServerStore();
const roomStore = useRoomStore();
const upsStore = useUpsStore();
const groupStore = useGroupStore();

const serverId = route.params.id as string;
const server = ref<Server | null>(null);
const loading = ref(true);
const error = ref('');
const showEditModal = ref(false);
const editFormData = ref<Server | null>(null);
const editError = ref<string | null>(null);
const activeTab = ref<'overview' | 'vms' | 'monitoring' | 'history'>(
  'overview',
);
const liveStatus = ref<'up' | 'down' | 'checking' | null>(null);
const isPerformingAction = ref(false);
const showTerminal = ref(false);
const showAuthModal = ref(false);
const sshCredentials = ref<{ username: string; password: string } | null>(null);
const powerState = ref<string | null>(null);
const checkingPowerState = ref(false);
const showCredentials = ref(false);
const showIloCredentials = ref(false);

const roomName = ref<string>('');
const upsName = ref<string>('');
const groupName = ref<string>('');

const serverMetrics = ref({
  status: 'active',
  uptime: '0d 0h 0m',
  cpuUsage: 0,
  memoryUsage: 0,
  memoryMB: 0,
  totalMemoryMB: 0,
});

const vms = ref<Vm[]>([]);

const timeline = ref([
  {
    id: 1,
    time: new Date().toLocaleString(),
    message: t('servers.timeline.started'),
    type: 'success',
    icon: PlayIconSolid,
  },
  {
    id: 2,
    time: new Date(Date.now() - 86400000).toLocaleString(),
    message: t('servers.timeline.reboot_completed'),
    type: 'info',
    icon: ArrowPathIconSolid,
  },
  {
    id: 3,
    time: new Date(Date.now() - 172800000).toLocaleString(),
    message: t('servers.timeline.maintenance_scheduled'),
    type: 'warning',
    icon: ExclamationTriangleIcon,
  },
]);

const loadServer = async () => {
  loading.value = true;
  error.value = '';

  try {
    server.value = await serverStore.loadServerById(serverId);

    if (server.value?.metrics) {
      updateMetricsFromServer(server.value.metrics);
    }

    if (
      server.value?.type === 'vcenter' ||
      (server.value?.type === 'esxi' && server.value?.ilo)
    ) {
      await checkPowerState();
    }

    if (server.value) {
      await loadEntityNames();
      await loadVms();
    }
  } catch (err: any) {
    error.value = err.message || t('servers.loading_error');
  } finally {
    loading.value = false;
  }
};

const loadVms = async () => {
  if (server.value?.type === 'vcenter') {
    vms.value = [];
    return;
  }

  try {
    const response = await fetchVms({
      serverId: serverId,
      includeMetrics: true,
      limit: 100,
    });
    vms.value = response.items;
  } catch (err) {
    console.warn('Failed to load VMs:', err);
    vms.value = [];
  }
};

const loadEntityNames = async () => {
  if (!server.value) return;

  try {
    await Promise.all([
      roomStore.list.length === 0 ? roomStore.fetchRooms() : Promise.resolve(),
      upsStore.list.length === 0
        ? upsStore.fetchUps(1, 100)
        : Promise.resolve(),
      groupStore.allGroups.length === 0
        ? groupStore.fetchAllGroups()
        : Promise.resolve(),
    ]);

    const room = roomStore.list.find((r) => r.id === server.value?.roomId);
    if (room) roomName.value = room.name;

    if (server.value.upsId) {
      const ups = upsStore.list.find((u) => u.id === server.value?.upsId);
      if (ups) upsName.value = ups.name;
    }

    if (server.value.groupId) {
      const group = groupStore.allGroups.find(
        (g) => g.id === server.value?.groupId,
      );
      if (group) groupName.value = group.name;
    }
  } catch (error) {
    console.error('Failed to load entity names:', error);
  }
};

const updateMetricsFromServer = (metrics: ServerMetricsDto) => {
  if (metrics.cpuUsage !== undefined) {
    serverMetrics.value.cpuUsage = metrics.cpuUsage;
  }

  if (metrics.memoryUsage !== undefined) {
    if (typeof metrics.memoryUsage === 'number' && metrics.memoryUsage > 100) {
      serverMetrics.value.memoryMB = metrics.memoryUsage;
      const estimatedTotalMemory = 32768;
      serverMetrics.value.totalMemoryMB = estimatedTotalMemory;
      serverMetrics.value.memoryUsage =
        (metrics.memoryUsage / estimatedTotalMemory) * 100;
    } else {
      serverMetrics.value.memoryUsage = metrics.memoryUsage;
    }
  }

  if (metrics.uptime !== undefined) {
    const uptimeSeconds = metrics.uptime;
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    serverMetrics.value.uptime = `${days}d ${hours}h ${minutes}m`;
  }

  if (metrics.powerState !== undefined) {
    powerState.value = metrics.powerState;
    serverMetrics.value.status =
      metrics.powerState === 'poweredOn' || metrics.powerState === 'On'
        ? 'active'
        : 'inactive';
  }
};

const checkPowerState = async () => {
  if (
    !server.value ||
    (server.value.type !== 'vcenter' && server.value.type !== 'esxi') ||
    !server.value.ilo
  ) {
    return;
  }

  checkingPowerState.value = true;
  try {
    const iloStatus = await serverStore.getServerPowerStatus(server.value.id);

    powerState.value = iloStatus.metrics.powerState;

    if (iloStatus.metrics) {
      updateMetricsFromServer(iloStatus.metrics);
    }
  } catch (error) {
    console.error('Failed to get ILO status:', error);
    powerState.value = null;
  } finally {
    checkingPowerState.value = false;
  }
};

const handleEdit = () => {
  if (server.value) {
    editFormData.value = { ...server.value };
    editError.value = null;
    showEditModal.value = true;
  }
};

const handleSaveEdit = async (updatedData: Partial<Server>) => {
  if (!server.value) return;

  try {
    editError.value = null;
    const updatedServer = await serverStore.editServer(
      server.value.id,
      updatedData,
    );
    server.value = updatedServer;
    showEditModal.value = false;
    toast.success(t('servers.update_success'));
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.message || err.message || t('servers.update_error');
    editError.value = errorMessage;
  }
};

const handleServerAction = async (action: 'start' | 'shutdown' | 'reboot') => {
  if (
    !server.value ||
    (server.value.type !== 'vcenter' && server.value.type !== 'esxi') ||
    !server.value.ilo
  ) {
    toast.error(t('servers.power_control_not_available'));
    return;
  }

  isPerformingAction.value = true;

  try {
    const iloAction =
      action === 'start' ? 'start' : action === 'shutdown' ? 'stop' : 'reset';
    const result = await serverStore.controlServerPower(
      server.value.id,
      iloAction,
    );

    const actionMessages = {
      start: t('servers.start_success'),
      shutdown: t('servers.shutdown_success'),
      reboot: t('servers.reboot_success'),
    };

    toast.success(actionMessages[action]);

    timeline.value.unshift({
      id: Date.now(),
      time: new Date().toLocaleString(),
      message: actionMessages[action],
      type: 'success',
      icon:
        action === 'start'
          ? PlayIconSolid
          : action === 'shutdown'
            ? StopIconSolid
            : ArrowPathIconSolid,
    });

    if (result.currentState) {
      powerState.value = result.currentState;
    }

    setTimeout(() => {
      checkPowerState();
    }, 3000);
  } catch (error: any) {
    const errorMessages = {
      start: t('servers.start_error'),
      shutdown: t('servers.shutdown_error'),
      reboot: t('servers.reboot_error'),
    };
    toast.error(error.message || errorMessages[action]);
  } finally {
    isPerformingAction.value = false;
  }
};

const handlePing = async () => {
  if (!server.value) return;

  liveStatus.value = 'checking';

  try {
    const response = await api.get(`/ping/hostname/${server.value.ip}`);
    const result = response.data;

    if (result.accessible) {
      liveStatus.value = 'up';
      toast.success(t('servers.ping_success'));
    } else {
      liveStatus.value = 'down';
      toast.warning(t('servers.ping_failed'));
    }
  } catch (error: any) {
    liveStatus.value = 'down';
    toast.error(error.message || t('servers.ping_error'));
  }

  setTimeout(() => {
    liveStatus.value = null;
  }, 5000);
};

const handleOpenTerminal = () => {
  if (!server.value) return;

  if (server.value.login && server.value.password) {
    sshCredentials.value = {
      username: server.value.login,
      password: server.value.password,
    };
    showTerminal.value = true;
  } else if (server.value.login) {
    sshCredentials.value = {
      username: server.value.login,
      password: '',
    };
    showAuthModal.value = true;
  } else {
    showAuthModal.value = true;
  }
};

const handleAuthConnect = (credentials: {
  username: string;
  password: string;
  remember: boolean;
}) => {
  sshCredentials.value = {
    username: credentials.username,
    password: credentials.password,
  };
  showAuthModal.value = false;
  showTerminal.value = true;
};

const handleTerminalClose = () => {
  showTerminal.value = false;
  if (!sshCredentials.value) return;
};

const handleVmAction = async (
  vmId: string,
  action: 'start' | 'stop' | 'restart',
) => {
  const vm = vms.value.find((v) => v.id === vmId);
  if (!vm) return;

  // TODO: replace by api call
  if (action === 'start') {
    vm.state = 'running';
    if (!vm.metrics) vm.metrics = {};
    vm.metrics.cpuUsage = Math.floor(Math.random() * 80) + 20;
    vm.metrics.powerState = 'running';
  } else if (action === 'stop') {
    vm.state = 'stopped';
    if (!vm.metrics) vm.metrics = {};
    vm.metrics.cpuUsage = 0;
    vm.metrics.powerState = 'stopped';
  } else if (action === 'restart') {
    vm.state = 'running';
    if (!vm.metrics) vm.metrics = {};
    vm.metrics.cpuUsage = Math.floor(Math.random() * 80) + 20;
    vm.metrics.powerState = 'running';
  }
};

onMounted(loadServer);
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-800"
  >
    <ServerHeader
      :server="server"
      :loading="loading"
      :live-status="liveStatus"
      :is-performing-action="isPerformingAction"
      :power-state="powerState"
      :checking-power-state="checkingPowerState"
      @server-action="handleServerAction"
      @ping="handlePing"
      @edit="handleEdit"
      @open-terminal="handleOpenTerminal"
    />

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center space-y-4">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
        ></div>
        <p class="text-slate-600 dark:text-slate-400">
          {{ t('servers.loading') }}
        </p>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-20">
      <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
      <p class="text-red-600 dark:text-red-400 text-lg">{{ error }}</p>
    </div>

    <div v-else-if="server" class="max-w-7xl mx-auto px-6 py-8">
      <div
        class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-700 mb-8"
      >
        <div class="border-b border-slate-200 dark:border-neutral-700">
          <nav class="flex space-x-8 px-6" aria-label="Tabs">
            <button
              v-for="tab in [
                {
                  key: 'overview',
                  label: t('servers.tabs.overview'),
                  icon: ServerIcon,
                },
                ...(server.type !== 'vcenter'
                  ? [
                      {
                        key: 'vms',
                        label: t('servers.tabs.virtual_machines'),
                        icon: CubeIcon,
                      },
                    ]
                  : []),
                {
                  key: 'monitoring',
                  label: t('servers.tabs.monitoring'),
                  icon: ChartBarIcon,
                },
                {
                  key: 'history',
                  label: t('servers.tabs.history'),
                  icon: ClockIcon,
                },
              ]"
              :key="tab.key"
              @click="activeTab = tab.key as any"
              :class="[
                'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
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
            <div v-if="server.type === 'vcenter'" class="mb-8">
              <div
                class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6"
              >
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0">
                    <ServerIcon
                      class="h-6 w-6 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div class="flex-1">
                    <h3
                      class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1"
                    >
                      {{ t('servers.vcenter_no_metrics') }}
                    </h3>
                    <p class="text-sm text-blue-700 dark:text-blue-300">
                      {{ t('servers.vcenter_no_metrics_explanation') }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <ServerMetricsCards
              v-if="server.type !== 'vcenter'"
              :metrics="serverMetrics"
            />

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ServerDetailsCard :server="server" />
              <ServerInfrastructureLinks
                :server="server"
                :room-name="roomName"
                :ups-name="upsName"
                :group-name="groupName"
              />
            </div>

            <div v-if="server.login || server.password">
              <div class="flex items-center justify-between mb-4">
                <h3
                  class="text-lg font-semibold text-slate-900 dark:text-white"
                >
                  {{ t('servers.credentials.section_title') }}
                </h3>
                <button
                  @click="showCredentials = !showCredentials"
                  class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {{
                    showCredentials
                      ? t('servers.credentials.hide_button')
                      : t('servers.credentials.show_button')
                  }}
                </button>
              </div>
              <transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <ServerCredentials
                  v-if="showCredentials"
                  :login="server.login"
                  :password="server.password"
                />
              </transition>
            </div>

            <div
              v-if="
                (server.type === 'vcenter' || server.type === 'esxi') &&
                server.ilo &&
                (server.ilo.login || server.ilo.password)
              "
            >
              <div class="flex items-center justify-between mb-4">
                <h3
                  class="text-lg font-semibold text-slate-900 dark:text-white"
                >
                  {{ t('servers.credentials.ilo_section_title') }}
                </h3>
                <button
                  @click="showIloCredentials = !showIloCredentials"
                  class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {{
                    showIloCredentials
                      ? t('servers.credentials.hide_button')
                      : t('servers.credentials.show_button')
                  }}
                </button>
              </div>
              <transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <ServerCredentials
                  v-if="showIloCredentials"
                  :login="server.ilo.login"
                  :password="server.ilo.password"
                />
              </transition>
            </div>
          </div>

          <div v-else-if="activeTab === 'vms'">
            <VirtualMachinesTab :vms="vms" @vm-action="handleVmAction" />
          </div>

          <div v-else-if="activeTab === 'monitoring'" class="space-y-6">
            <div class="text-center py-20">
              <ChartBarIcon
                class="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4"
              />
              <p class="text-slate-600 dark:text-slate-400 text-lg">
                {{ t('servers.monitoring_placeholder') }}
              </p>
              <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">
                {{ t('servers.monitoring_coming_soon') }}
              </p>
            </div>
          </div>

          <div v-else-if="activeTab === 'history'">
            <ServerHistoryTab :timeline="timeline" />
          </div>
        </div>
      </div>
    </div>

    <ServerEditModal
      :show="showEditModal"
      :server="editFormData"
      :error="editError"
      @close="showEditModal = false"
      @save="handleSaveEdit"
    />

    <SshAuthModal
      v-if="server"
      :is-open="showAuthModal"
      :server-ip="server.ip"
      :default-username="server.login || ''"
      @close="showAuthModal = false"
      @connect="handleAuthConnect"
    />

    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="showTerminal && server && (sshCredentials || showAuthModal)"
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      >
        <div class="absolute inset-4 md:inset-8 lg:inset-12 flex flex-col">
          <div class="flex-1 rounded-xl overflow-hidden shadow-2xl">
            <SshTerminal
              v-if="sshCredentials"
              :ip="server.ip"
              :username="sshCredentials.username"
              :password="sshCredentials.password"
              @close="handleTerminalClose"
              class="h-full"
            />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
