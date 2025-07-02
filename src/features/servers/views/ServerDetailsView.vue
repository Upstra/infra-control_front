<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  ArrowLeftIcon,
  ServerIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  SignalIcon,
  PencilIcon,
  CpuChipIcon,
  CircleStackIcon,
  CloudIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  BoltIcon,
  CubeIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';
import {
  PlayIcon as PlayIconSolid,
  StopIcon as StopIconSolid,
  ArrowPathIcon as ArrowPathIconSolid
} from '@heroicons/vue/24/solid';
import type { Server } from '../types';
import { fetchServers } from '../api';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const server = ref<Server | null>(null);
const loading = ref(true);
const error = ref('');
const showEditModal = ref(false);
const activeTab = ref<'overview' | 'vms' | 'monitoring' | 'history'>('overview');
const liveStatus = ref<'up' | 'down' | 'checking' | null>(null);
const isPerformingAction = ref(false);

// Mock VM data
const vms = ref([
  {
    id: 'vm-1',
    name: 'Web Server VM',
    state: 'running',
    cpu: 75,
    memory: 4096,
    storage: 50,
    ip: '192.168.1.100',
    os: 'Ubuntu 22.04 LTS'
  },
  {
    id: 'vm-2',
    name: 'Database VM',
    state: 'running',
    cpu: 45,
    memory: 8192,
    storage: 120,
    ip: '192.168.1.101',
    os: 'CentOS 8'
  },
  {
    id: 'vm-3',
    name: 'Cache VM',
    state: 'stopped',
    cpu: 0,
    memory: 2048,
    storage: 30,
    ip: '192.168.1.102',
    os: 'Alpine Linux'
  }
]);

const timeline = ref([
  {
    id: 1,
    time: new Date().toLocaleString(),
    message: t('servers.timeline.started'),
    type: 'success',
    icon: PlayIconSolid
  },
  {
    id: 2,
    time: new Date(Date.now() - 86400000).toLocaleString(),
    message: t('servers.timeline.shutdown'),
    type: 'warning',
    icon: StopIconSolid
  },
  {
    id: 3,
    time: new Date(Date.now() - 172800000).toLocaleString(),
    message: t('servers.timeline.ilo_denied'),
    type: 'error',
    icon: ExclamationTriangleIcon
  }
]);

const serverMetrics = ref({
  cpu: 68,
  memory: 72,
  storage: 45,
  network: 23,
  uptime: '15d 7h 32m'
});

const vmStats = computed(() => ({
  total: vms.value.length,
  running: vms.value.filter(vm => vm.state === 'running').length,
  stopped: vms.value.filter(vm => vm.state === 'stopped').length,
  totalCpu: vms.value.reduce((sum, vm) => sum + vm.cpu, 0),
  totalMemory: vms.value.reduce((sum, vm) => sum + vm.memory, 0)
}));

onMounted(async () => {
  loading.value = true;
  const id = route.params.id as string;

  try {
    const res = await fetchServers();
    const found = res.data.find((s: Server) => s.id === id);
    server.value = found ?? getMockServers().find((s) => s.id === id) as Server;

    if (!server.value) error.value = t('servers.not_found');
  } catch (err: any) {
    error.value = t('servers.loading_error');
  } finally {
    loading.value = false;
  }
});

const getMockServers = (): Server[] => [
  {
    id: '1',
    name: 'Production Server Alpha',
    ip: '192.168.0.1',
    state: 'active',
    adminUrl: 'https://admin.local',
    login: 'root',
    type: 'physical',
    priority: 1,
    grace_period_on: 10,
    grace_period_off: 10,
    roomId: 'room-1',
    groupId: 'group-1',
    upsId: 'ups-1',
    ilo: {
      name: 'ILO Alpha',
      ip: '192.168.0.100',
      login: 'admin',
      password: 'pass',
    },
  },
];

const handleServerAction = async (action: 'start' | 'shutdown' | 'reboot') => {
  isPerformingAction.value = true;
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const actionMessages = {
    start: t('servers.starting'),
    shutdown: t('servers.shutting_down'),
    reboot: t('servers.rebooting')
  };
  
  timeline.value.unshift({
    id: Date.now(),
    time: new Date().toLocaleString(),
    message: actionMessages[action],
    type: action === 'shutdown' ? 'warning' : 'info',
    icon: action === 'start' ? PlayIconSolid : action === 'shutdown' ? StopIconSolid : ArrowPathIconSolid
  });
  
  isPerformingAction.value = false;
};

const handlePing = async () => {
  liveStatus.value = 'checking';
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  liveStatus.value = Math.random() > 0.3 ? 'up' : 'down';
  
  setTimeout(() => {
    liveStatus.value = null;
  }, 5000);
};

const handleVmAction = async (vmId: string, action: 'start' | 'stop' | 'restart') => {
  const vm = vms.value.find(v => v.id === vmId);
  if (!vm) return;
  
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

const getStatusColor = (state: string) => {
  switch (state) {
    case 'active':
    case 'running':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'inactive':
    case 'stopped':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getMetricColor = (value: number) => {
  if (value >= 80) return 'text-red-600 bg-red-100';
  if (value >= 60) return 'text-amber-600 bg-amber-100';
  return 'text-emerald-600 bg-emerald-100';
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div class="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="router.back()"
              class="flex items-center px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200"
            >
              <ArrowLeftIcon class="h-4 w-4 mr-2" />
              {{ t('common.back') }}
            </button>
            
            <div class="flex items-center space-x-3" v-if="server">
              <div class="p-2 bg-blue-100 rounded-lg">
                <ServerIcon class="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 class="text-2xl font-bold text-slate-900">{{ server.name }}</h1>
                <p class="text-sm text-slate-600">{{ server.ip }} • {{ server.type }}</p>
              </div>
            </div>
          </div>
          
          <div class="flex items-center space-x-2" v-if="server">
            <span
              :class="[
                'px-3 py-1 text-xs font-semibold rounded-full border',
                getStatusColor(server.state)
              ]"
            >
              {{ server.state === 'active' ? t('servers.active') : t('servers.inactive') }}
            </span>
            
            <div v-if="liveStatus" class="flex items-center space-x-2">
              <div
                v-if="liveStatus === 'checking'"
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"
              ></div>
              <span
                v-else
                :class="[
                  'flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full',
                  liveStatus === 'up' ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100'
                ]"
              >
                <div :class="[
                  'w-2 h-2 rounded-full',
                  liveStatus === 'up' ? 'bg-emerald-500' : 'bg-red-500'
                ]"></div>
                <span>{{ liveStatus === 'up' ? t('servers.online') : t('servers.offline') }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-slate-600">{{ t('servers.loading') }}</p>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-20">
      <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
      <p class="text-red-600 text-lg">{{ error }}</p>
    </div>

    <div v-else-if="server" class="max-w-7xl mx-auto px-6 py-8">
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap gap-3">
            <button
              @click="handleServerAction('start')"
              :disabled="isPerformingAction"
              class="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayIcon class="h-4 w-4 mr-2" />
              {{ t('servers.start') }}
            </button>
            
            <button
              @click="handleServerAction('shutdown')"
              :disabled="isPerformingAction"
              class="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <StopIcon class="h-4 w-4 mr-2" />
              {{ t('servers.shutdown') }}
            </button>
            
            <button
              @click="handleServerAction('reboot')"
              :disabled="isPerformingAction"
              class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon class="h-4 w-4 mr-2" />
              {{ t('servers.reboot') }}
            </button>
            
            <button
              @click="handlePing"
              :disabled="liveStatus === 'checking'"
              class="flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SignalIcon class="h-4 w-4 mr-2" />
              {{ t('servers.ping') }}
            </button>
          </div>
          
          <button
            @click="showEditModal = true"
            class="flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <PencilIcon class="h-4 w-4 mr-2" />
            {{ t('servers.edit') }}
          </button>
        </div>
        
        <div v-if="isPerformingAction" class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div class="flex items-center space-x-3">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span class="text-sm text-blue-800">{{ t('servers.action_in_progress') }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 mb-8">
        <div class="border-b border-slate-200">
          <nav class="flex space-x-8 px-6" aria-label="Tabs">
            <button
              v-for="tab in [
                { key: 'overview', label: t('servers.tabs.overview'), icon: ServerIcon },
                { key: 'vms', label: t('servers.tabs.virtual_machines'), icon: CubeIcon },
                { key: 'monitoring', label: t('servers.tabs.monitoring'), icon: ChartBarIcon },
                { key: 'history', label: t('servers.tabs.history'), icon: ClockIcon }
              ]"
              :key="tab.key"
              @click="activeTab = tab.key as any"
              :class="[
                'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
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
              <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-blue-800">CPU Usage</p>
                    <p class="text-2xl font-bold text-blue-900">{{ serverMetrics.cpu }}%</p>
                  </div>
                  <CpuChipIcon class="h-8 w-8 text-blue-600" />
                </div>
                <div class="mt-2 bg-blue-200 rounded-full h-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${serverMetrics.cpu}%` }"
                  ></div>
                </div>
              </div>
              
              <div class="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-emerald-800">Memory</p>
                    <p class="text-2xl font-bold text-emerald-900">{{ serverMetrics.memory }}%</p>
                  </div>
                  <CircleStackIcon class="h-8 w-8 text-emerald-600" />
                </div>
                <div class="mt-2 bg-emerald-200 rounded-full h-2">
                  <div 
                    class="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${serverMetrics.memory}%` }"
                  ></div>
                </div>
              </div>
              
              <div class="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-amber-800">Storage</p>
                    <p class="text-2xl font-bold text-amber-900">{{ serverMetrics.storage }}%</p>
                  </div>
                  <CloudIcon class="h-8 w-8 text-amber-600" />
                </div>
                <div class="mt-2 bg-amber-200 rounded-full h-2">
                  <div 
                    class="bg-amber-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${serverMetrics.storage}%` }"
                  ></div>
                </div>
              </div>
              
              <div class="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-purple-800">Uptime</p>
                    <p class="text-lg font-bold text-purple-900">{{ serverMetrics.uptime }}</p>
                  </div>
                  <ClockIcon class="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div class="space-y-6">
                <h3 class="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                  <ServerIcon class="h-5 w-5 text-blue-600" />
                  <span>{{ t('servers.server_details') }}</span>
                </h3>
                
                <div class="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div class="space-y-2">
                      <p><span class="font-medium text-slate-600">{{ t('servers.ip') }}:</span> <span class="text-slate-900">{{ server.ip }}</span></p>
                      <p><span class="font-medium text-slate-600">{{ t('servers.type') }}:</span> <span class="text-slate-900">{{ server.type }}</span></p>
                      <p><span class="font-medium text-slate-600">{{ t('servers.priority') }}:</span> <span class="text-slate-900">{{ server.priority }}</span></p>
                    </div>
                    <div class="space-y-2">
                      <p><span class="font-medium text-slate-600">{{ t('servers.grace_on') }}:</span> <span class="text-slate-900">{{ server.grace_period_on }}s</span></p>
                      <p><span class="font-medium text-slate-600">{{ t('servers.grace_off') }}:</span> <span class="text-slate-900">{{ server.grace_period_off }}s</span></p>
                      <p>
                        <span class="font-medium text-slate-600">{{ t('servers.admin_url') }}:</span>
                        <a :href="server.adminUrl" target="_blank" class="text-blue-600 hover:text-blue-800 underline ml-1">{{ server.adminUrl }}</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <h3 class="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                  <MapPinIcon class="h-5 w-5 text-emerald-600" />
                  <span>{{ t('servers.infrastructure_links') }}</span>
                </h3>
                
                <div class="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div class="space-y-2 text-sm">
                    <p>
                      <span class="font-medium text-slate-600">{{ t('servers.room') }}:</span>
                      <router-link :to="`/rooms/${server.roomId}`" class="text-blue-600 hover:text-blue-800 underline ml-1">
                        {{ server.roomId }}
                      </router-link>
                    </p>
                    <p>
                      <span class="font-medium text-slate-600">{{ t('servers.group') }}:</span>
                      <router-link :to="`/groups/${server.groupId}`" class="text-blue-600 hover:text-blue-800 underline ml-1">
                        {{ server.groupId }}
                      </router-link>
                    </p>
                    <p>
                      <span class="font-medium text-slate-600">{{ t('servers.ups') }}:</span>
                      <router-link :to="`/ups/${server.upsId}`" class="text-blue-600 hover:text-blue-800 underline ml-1">
                        {{ server.upsId }}
                      </router-link>
                    </p>
                  </div>
                </div>

                
                <div v-if="server.ilo" class="space-y-4">
                  <h4 class="text-md font-semibold text-slate-900 flex items-center space-x-2">
                    <BoltIcon class="h-4 w-4 text-amber-600" />
                    <span>{{ t('servers.ilo_section') }}</span>
                  </h4>
                  
                  <div class="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div class="space-y-2 text-sm">
                      <p><span class="font-medium text-amber-800">{{ t('servers.ilo_name') }}:</span> <span class="text-amber-900">{{ server.ilo.name }}</span></p>
                      <p><span class="font-medium text-amber-800">{{ t('servers.ilo_ip') }}:</span> <span class="text-amber-900">{{ server.ilo.ip }}</span></p>
                      <p><span class="font-medium text-amber-800">{{ t('servers.ilo_login') }}:</span> <span class="text-amber-900">{{ server.ilo.login }}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
          <div v-else-if="activeTab === 'vms'" class="space-y-6">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="bg-white border border-slate-200 rounded-xl p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-slate-600">Total VMs</p>
                    <p class="text-2xl font-bold text-slate-900">{{ vmStats.total }}</p>
                  </div>
                  <CubeIcon class="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div class="bg-white border border-slate-200 rounded-xl p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-slate-600">Running</p>
                    <p class="text-2xl font-bold text-emerald-600">{{ vmStats.running }}</p>
                  </div>
                  <CheckCircleIcon class="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              
              <div class="bg-white border border-slate-200 rounded-xl p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-slate-600">Stopped</p>
                    <p class="text-2xl font-bold text-red-600">{{ vmStats.stopped }}</p>
                  </div>
                  <StopIcon class="h-8 w-8 text-red-600" />
                </div>
              </div>
              
              <div class="bg-white border border-slate-200 rounded-xl p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-slate-600">Total RAM</p>
                    <p class="text-2xl font-bold text-purple-600">{{ (vmStats.totalMemory / 1024).toFixed(1) }}GB</p>
                  </div>
                  <CircleStackIcon class="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-slate-900">Virtual Machines</h3>
              
              <div class="grid grid-cols-1 gap-4">
                <div
                  v-for="vm in vms"
                  :key="vm.id"
                  class="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                      <div class="p-2 bg-blue-100 rounded-lg">
                        <CubeIcon class="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 class="text-lg font-semibold text-slate-900">{{ vm.name }}</h4>
                        <p class="text-sm text-slate-600">{{ vm.os }} • {{ vm.ip }}</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-3">
                      <span
                        :class="[
                          'px-3 py-1 text-xs font-semibold rounded-full border',
                          getStatusColor(vm.state)
                        ]"
                      >
                        {{ vm.state }}
                      </span>
                      
                      <div class="flex space-x-1">
                        <button
                          v-if="vm.state === 'stopped'"
                          @click="handleVmAction(vm.id, 'start')"
                          class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          :title="t('servers.vm_start')"
                        >
                          <PlayIcon class="h-4 w-4" />
                        </button>
                        <button
                          v-if="vm.state === 'running'"
                          @click="handleVmAction(vm.id, 'stop')"
                          class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          :title="t('servers.vm_stop')"
                        >
                          <StopIcon class="h-4 w-4" />
                        </button>
                        <button
                          v-if="vm.state === 'running'"
                          @click="handleVmAction(vm.id, 'restart')"
                          class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          :title="t('servers.vm_restart')"
                        >
                          <ArrowPathIcon class="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div class="text-center">
                      <p class="text-sm font-medium text-slate-600">CPU</p>
                      <p :class="['text-lg font-bold', getMetricColor(vm.cpu)]">{{ vm.cpu }}%</p>
                    </div>
                    <div class="text-center">
                      <p class="text-sm font-medium text-slate-600">Memory</p>
                      <p class="text-lg font-bold text-slate-900">{{ (vm.memory / 1024).toFixed(1) }}GB</p>
                    </div>
                    <div class="text-center">
                      <p class="text-sm font-medium text-slate-600">Storage</p>
                      <p class="text-lg font-bold text-slate-900">{{ vm.storage }}GB</p>
                    </div>
                    <div class="text-center">
                      <p class="text-sm font-medium text-slate-600">IP Address</p>
                      <p class="text-lg font-bold text-slate-900">{{ vm.ip }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
          <div v-else-if="activeTab === 'monitoring'" class="space-y-6">
            <div class="text-center py-20">
              <ChartBarIcon class="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p class="text-slate-600 text-lg">{{ t('servers.monitoring_placeholder') }}</p>
              <p class="text-slate-500 text-sm mt-2">{{ t('servers.monitoring_coming_soon') }}</p>
            </div>
          </div>

          
          <div v-else-if="activeTab === 'history'" class="space-y-6">
            <h3 class="text-lg font-semibold text-slate-900">{{ t('servers.history') }}</h3>
            
            <div class="space-y-4">
              <div
                v-for="item in timeline"
                :key="item.id"
                class="flex items-start space-x-4 p-4 bg-white border border-slate-200 rounded-xl"
              >
                <div :class="[
                  'p-2 rounded-lg',
                  item.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                  item.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                  item.type === 'error' ? 'bg-red-100 text-red-600' :
                  'bg-blue-100 text-blue-600'
                ]">
                  <component :is="item.icon" class="h-4 w-4" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-slate-900">{{ item.message }}</p>
                  <p class="text-xs text-slate-500 mt-1">{{ item.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <div
      v-if="showEditModal && server"
      class="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 class="text-xl font-bold text-slate-900">{{ t('servers.edit_title') }}</h2>
          <button
            @click="showEditModal = false"
            class="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
        
        <form class="p-6 space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('servers.name') }}</label>
              <input
                v-model="server.name"
                type="text"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('servers.ip') }}</label>
              <input
                v-model="server.ip"
                type="text"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('servers.type') }}</label>
              <select
                v-model="server.type"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="physical">{{ t('servers.physical') }}</option>
                <option value="virtual">{{ t('servers.virtual') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('servers.priority') }}</label>
              <input
                v-model.number="server.priority"
                type="number"
                min="1"
                max="10"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('servers.admin_url') }}</label>
              <input
                v-model="server.adminUrl"
                type="url"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {{ t('servers.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>