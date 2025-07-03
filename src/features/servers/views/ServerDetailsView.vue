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
import type { Server } from '../types';
import { fetchServerById } from '../api';
import ServerHeader from '../components/ServerHeader.vue';
import ServerMetricsCards from '../components/ServerMetricsCards.vue';
import ServerDetailsCard from '../components/ServerDetailsCard.vue';
import ServerInfrastructureLinks from '../components/ServerInfrastructureLinks.vue';
import VirtualMachinesTab from '../components/VirtualMachinesTab.vue';
import ServerHistoryTab from '../components/ServerHistoryTab.vue';
import ServerEditModal from '../components/ServerEditModal.vue';
import SshTerminal from '../components/SshTerminal.vue';
import SshAuthModal from '../components/SshAuthModal.vue';

const route = useRoute();
const { t } = useI18n();

const serverId = route.params.id as string;
const server = ref<Server | null>(null);
const loading = ref(true);
const error = ref('');
const showEditModal = ref(false);
const activeTab = ref<'overview' | 'vms' | 'monitoring' | 'history'>(
  'overview',
);
const liveStatus = ref<'up' | 'down' | 'checking' | null>(null);
const isPerformingAction = ref(false);
const showTerminal = ref(false);
const showAuthModal = ref(false);
const sshCredentials = ref<{ username: string; password: string } | null>(null);

const serverMetrics = ref({
  status: 'active',
  uptime: '15d 4h 23m',
  cpuUsage: 35,
  memoryUsage: 68,
  diskUsage: 42,
  networkIn: 125.6,
  networkOut: 89.3,
  temperature: 42.5,
  lastReboot: new Date(Date.now() - 1296000000).toLocaleDateString(),
  nextMaintenance: new Date(Date.now() + 2592000000).toLocaleDateString(),
});

// TODO: replace by api call
const vms = ref([
  {
    id: 'vm-1',
    name: 'Web Server VM',
    state: 'running',
    cpu: 75,
    memory: 4096,
    storage: 50,
    ip: '192.168.1.100',
    os: 'Ubuntu 22.04 LTS',
  },
  {
    id: 'vm-2',
    name: 'Database VM',
    state: 'running',
    cpu: 45,
    memory: 8192,
    storage: 120,
    ip: '192.168.1.101',
    os: 'CentOS 8',
  },
  {
    id: 'vm-3',
    name: 'Cache VM',
    state: 'stopped',
    cpu: 0,
    memory: 2048,
    storage: 30,
    ip: '192.168.1.102',
    os: 'Alpine Linux',
  },
]);

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
    server.value = await fetchServerById(serverId);
  } catch (err: any) {
    error.value = err.message || t('servers.loading_error');
    console.error('Error loading server:', err);
  } finally {
    loading.value = false;
  }
};

const handleServerAction = async (action: 'start' | 'shutdown' | 'reboot') => {
  isPerformingAction.value = true;

  // TODO: replace by api call
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const actionMessages = {
    start: t('servers.starting'),
    shutdown: t('servers.shutting_down'),
    reboot: t('servers.rebooting'),
  };

  timeline.value.unshift({
    id: Date.now(),
    time: new Date().toLocaleString(),
    message: actionMessages[action],
    type: action === 'shutdown' ? 'warning' : 'info',
    icon:
      action === 'start'
        ? PlayIconSolid
        : action === 'shutdown'
          ? StopIconSolid
          : ArrowPathIconSolid,
  });

  isPerformingAction.value = false;
};

const handlePing = async () => {
  liveStatus.value = 'checking';

  // TODO: replace by api call
  await new Promise((resolve) => setTimeout(resolve, 1500));

  liveStatus.value = Math.random() > 0.3 ? 'up' : 'down';

  setTimeout(() => {
    liveStatus.value = null;
  }, 5000);
};

const handleOpenTerminal = () => {
  if (!sshCredentials.value) {
    showAuthModal.value = true;
  } else {
    showTerminal.value = true;
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
  // Clear credentials if they weren't meant to be remembered
  if (!sshCredentials.value) return;
  // Note: We don't have access to the remember flag here,
  // so credentials stay for the session
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
    vm.cpu = Math.floor(Math.random() * 80) + 20;
  } else if (action === 'stop') {
    vm.state = 'stopped';
    vm.cpu = 0;
  } else if (action === 'restart') {
    vm.state = 'running';
    vm.cpu = Math.floor(Math.random() * 80) + 20;
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
      @server-action="handleServerAction"
      @ping="handlePing"
      @edit="showEditModal = true"
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
                {
                  key: 'vms',
                  label: t('servers.tabs.virtual_machines'),
                  icon: CubeIcon,
                },
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
            <ServerMetricsCards :metrics="serverMetrics" />

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ServerDetailsCard :server="server" />
              <ServerInfrastructureLinks :server="server" />
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
      :server="server"
      @close="showEditModal = false"
      @save="showEditModal = false"
    />

    <SshAuthModal
      v-if="server"
      :is-open="showAuthModal"
      :server-ip="server.ip"
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
