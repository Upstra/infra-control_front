<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
  >
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        {{ t('migration.destinations.title') }}
      </h2>
      <div class="flex items-center gap-3">
        <button
          @click="refreshVMs"
          :disabled="isRefreshing"
          class="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded text-sm font-medium transition-colors"
          :title="t('migration.refresh_vms')"
        >
          <RefreshCw :class="['w-4 h-4', isRefreshing && 'animate-spin']" />
          {{
            isRefreshing
              ? t('migration.refreshing')
              : t('migration.refresh_vms')
          }}
        </button>
        <button
          v-if="yamlPath"
          @click="showYamlPreview = !showYamlPreview"
          class="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
        >
          <FileCode class="w-4 h-4" />
          {{ t('migration.destinations.preview_yaml') }}
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
    </div>

    <div
      v-else-if="error"
      class="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-4"
    >
      <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
    </div>

    <div
      v-else-if="hasMissingVmwareMoids"
      class="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-4 border border-yellow-200 dark:border-yellow-800"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            {{ t('migration.destinations.vmware_discovery_required') }}
          </h3>
          <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p class="mb-2">
              {{ t('migration.destinations.vmware_discovery_description') }}
            </p>
            <ul class="list-disc list-inside space-y-1">
              <li v-for="server in serversWithoutVmwareMoid" :key="server.id">
                <strong>{{ server.name }}</strong> ({{ server.ip }})
              </li>
            </ul>
            <p class="mt-2">
              {{ t('migration.destinations.vmware_discovery_action') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="server in esxiServers"
        :key="server.id"
        class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <Server class="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span class="font-medium text-gray-900 dark:text-white">{{
              server.name
            }}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400"
              >({{ server.ip }})</span
            >
          </div>
          <div class="flex items-center gap-3 text-sm mt-1">
            <span class="text-gray-600 dark:text-gray-400">
              {{
                getRoomName(server.roomId) ||
                t('migration.destinations.no_room')
              }}
            </span>
            <div
              v-if="getServerStatus(server.id).checking"
              class="flex items-center gap-1 text-gray-500 dark:text-gray-400"
            >
              <div
                class="animate-spin rounded-full h-3 w-3 border-b-2 border-current"
              ></div>
              <span class="text-xs">{{ t('servers.loading') }}</span>
            </div>
            <div v-else class="flex items-center gap-3">
              <div class="flex items-center gap-1">
                <Activity
                  :class="[
                    'w-3 h-3',
                    getStatusColor(getServerStatus(server.id).powerState),
                  ]"
                />
                <span
                  :class="[
                    'text-xs',
                    getStatusColor(getServerStatus(server.id).powerState),
                  ]"
                >
                  {{ getStatusText(getServerStatus(server.id).powerState) }}
                </span>
              </div>
              <div
                v-if="getServerStatus(server.id).cpuUsage !== null"
                class="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400"
              >
                <Cpu class="w-3 h-3" />
                <span
                  >{{
                    Math.round(getServerStatus(server.id).cpuUsage || 0)
                  }}%</span
                >
              </div>
              <div
                v-if="getServerStatus(server.id).vmCount > 0"
                class="text-xs text-gray-600 dark:text-gray-400"
              >
                {{ getServerStatus(server.id).vmCount }} {{ t('nav.vms') }}
              </div>
            </div>
          </div>
        </div>

        <ArrowRight class="w-5 h-5 text-gray-400" />

        <div class="flex-1">
          <select
            v-model="destinationMap[server.id]"
            @change="updateHasChanges"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">
              {{ t('migration.destinations.no_action') }}
            </option>
            <option value="shutdown-only">
              {{ t('migration.destinations.shutdown_only') }}
            </option>
            <option
              v-for="dest in getAvailableDestinations(server.id)"
              :key="dest.id"
              :value="dest.id"
            >
              {{ dest.name }} -
              {{
                getRoomName(dest.roomId) || t('migration.destinations.no_room')
              }}
              <template
                v-if="
                  !getServerStatus(dest.id).checking &&
                  getServerStatus(dest.id).powerState
                "
              >
                ({{ getStatusText(getServerStatus(dest.id).powerState) }})
              </template>
            </option>
          </select>
        </div>

        <button
          v-if="destinationMap[server.id]"
          @click="removeDestination(server.id)"
          class="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors"
          :title="t('migration.destinations.remove')"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div
        class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <button
          @click="resetDestinations"
          :disabled="!hasChanges"
          class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
        >
          {{ t('migration.destinations.reset') }}
        </button>
        <button
          @click="saveDestinations"
          :disabled="!hasChanges || isSaving"
          class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors flex items-center gap-2"
        >
          <Save class="w-4 h-4" />
          {{ t('migration.destinations.save') }}
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showYamlPreview"
        @click="showYamlPreview = false"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <div
          @click.stop
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col"
        >
          <div
            class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
          >
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('migration.destinations.yaml_preview_title') }}
            </h3>
            <button
              @click="showYamlPreview = false"
              class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="flex-1 overflow-auto p-4">
            <pre
              class="text-sm font-mono text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto"
              >{{ yamlContent }}</pre
            >
          </div>
          <div
            class="p-4 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700"
          >
            {{ t('migration.destinations.yaml_info') }}
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Server,
  ArrowRight,
  X,
  Save,
  FileCode,
  Activity,
  Cpu,
  RefreshCw,
} from 'lucide-vue-next';
import { useServerStore } from '@/features/servers/store';
import { useRoomStore } from '@/features/rooms/store';
import { useUpsStore } from '@/features/ups/store';
import { useMigrationStore } from '../store';
import { useToast } from '@/shared/composables/useToast';
import { migrationApi } from '../api';
import { fetchVms } from '@/features/vms/api';
import { getPriorityLabel } from '@/features/groups/utils/priority-utils';
import { syncVMs } from '@/features/vmware/api';
import { usePriorityStore } from '@/features/groups/stores/usePriorityStore';

const { t } = useI18n();
const { showToast } = useToast();
const serverStore = useServerStore();
const migrationStore = useMigrationStore();
const roomsStore = useRoomStore();
const upsStore = useUpsStore();
const priorityStore = usePriorityStore();

const destinationMap = ref<Record<string, string>>({});
const originalDestinations = ref<Record<string, string>>({});
const hasChanges = ref(false);
const isSaving = ref(false);
const showYamlPreview = ref(false);
const yamlContent = ref('');
const isRefreshing = ref(false);
const serverStatusMap = ref<
  Record<
    string,
    {
      powerState: string | null;
      cpuUsage: number | null;
      memoryUsage: number | null;
      vmCount: number;
      vms?: Array<{
        id: string;
        name: string;
        powerState: string;
        cpuUsage?: number;
        memoryUsage?: number;
      }>;
      checking: boolean;
    }
  >
>({});
const loadingStatuses = ref(false);

const isLoading = computed(
  () => serverStore.isLoading || migrationStore.isLoading,
);
const error = computed(() => migrationStore.error);
const yamlPath = computed(() => migrationStore.yamlPath);

const esxiServers = computed(() =>
  serverStore.list.filter((server) => server.type === 'esxi'),
);

const serversWithoutVmwareMoid = computed(() =>
  esxiServers.value.filter((server) => !server.vmwareHostMoid),
);

const hasMissingVmwareMoids = computed(
  () => serversWithoutVmwareMoid.value.length > 0,
);

const getAvailableDestinations = (sourceId: string) => {
  return esxiServers.value.filter((server) => server.id !== sourceId);
};

const updateHasChanges = () => {
  hasChanges.value =
    JSON.stringify(destinationMap.value) !==
    JSON.stringify(originalDestinations.value);

  const selectedCount = Object.values(destinationMap.value).filter(
    (value) => value !== '',
  ).length;

  migrationStore.updateSelectedDestinationsCount(selectedCount);
};

const removeDestination = (serverId: string) => {
  destinationMap.value[serverId] = '';
  updateHasChanges();
};

const resetDestinations = () => {
  destinationMap.value = { ...originalDestinations.value };
  hasChanges.value = false;
};

const refreshVMs = async () => {
  isRefreshing.value = true;

  try {
    const result = await syncVMs();

    if (result.success) {
      showToast(
        result.changes && result.duration
          ? t('migration.sync_success_details', {
              changes: result.changes,
              duration: result.duration,
            })
          : t('migration.sync_success'),
        'success',
      );

      await priorityStore.fetchAllData();
      await serverStore.fetchServers();
      await migrationStore.fetchDestinations();
    } else {
      showToast(result.message || t('migration.sync_error'), 'error');
    }
  } catch (error: any) {
    console.error('Error syncing VMs:', error);
    showToast(t('migration.sync_error'), 'error');
  } finally {
    isRefreshing.value = false;
  }
};

const saveDestinations = async () => {
  try {
    isSaving.value = true;

    const serversToRemove = Object.entries(destinationMap.value)
      .filter(([_, destId]) => destId === '')
      .map(([sourceServerId]) => sourceServerId)
      .filter((serverId) => serverId && serverId !== 'undefined');

    for (const serverId of serversToRemove) {
      if (!serverId || serverId === 'undefined' || serverId === 'null') {
        console.error('Invalid server ID for removal:', serverId);
        continue;
      }

      try {
        await migrationStore.removeDestination(serverId);
      } catch (error) {
        console.error(
          `Failed to remove destination for server ${serverId}:`,
          error,
        );
      }
    }

    const destinations = Object.entries(destinationMap.value)
      .filter(
        ([sourceServerId, destId]) =>
          destId !== '' && sourceServerId && sourceServerId !== 'undefined',
      )
      .map(([sourceServerId, destId]) => {
        if (destId === 'shutdown-only') {
          return { sourceServerId };
        }
        return {
          sourceServerId,
          destinationServerId: destId,
        };
      });

    if (destinations.length > 0) {
      await migrationStore.configureDestinations({ destinations });
    }

    originalDestinations.value = { ...destinationMap.value };
    hasChanges.value = false;

    showToast(t('migration.destinations.save_success'), 'success');
    await generateYamlPreview();
  } catch (error) {
    showToast(t('migration.destinations.save_error'), 'error');
  } finally {
    isSaving.value = false;
  }
};

const getRoomName = (roomId: string) => {
  const room = roomsStore.list.find((r) => r.id === roomId);
  return room?.name || '';
};

const getServerStatus = (serverId: string) => {
  return (
    serverStatusMap.value[serverId] || {
      powerState: null,
      cpuUsage: null,
      memoryUsage: null,
      vmCount: 0,
      checking: false,
    }
  );
};

const getStatusColor = (powerState: string | null) => {
  if (!powerState) return 'text-gray-500 dark:text-gray-400';
  switch (powerState.toLowerCase()) {
    case 'on':
    case 'poweredon':
      return 'text-green-600 dark:text-green-400';
    case 'off':
    case 'poweredoff':
      return 'text-red-600 dark:text-red-400';
    case 'standby':
    case 'suspended':
      return 'text-yellow-600 dark:text-yellow-400';
    default:
      return 'text-gray-500 dark:text-gray-400';
  }
};

const getStatusText = (powerState: string | null) => {
  if (!powerState) return t('common.unknown');
  switch (powerState.toLowerCase()) {
    case 'on':
    case 'poweredon':
      return t('servers.online');
    case 'off':
    case 'poweredoff':
      return t('servers.offline');
    case 'standby':
    case 'suspended':
      return 'Standby';
    default:
      return powerState;
  }
};

const loadServerStatuses = async () => {
  if (loadingStatuses.value) return;
  loadingStatuses.value = true;

  try {
    const statusPromises = esxiServers.value.map(async (server) => {
      if (!serverStatusMap.value[server.id]) {
        serverStatusMap.value[server.id] = {
          powerState: null,
          cpuUsage: null,
          memoryUsage: null,
          vmCount: 0,
          checking: true,
        };
      }

      try {
        if (server.type === 'esxi' && server.ilo) {
          const iloStatus = await serverStore.getServerPowerStatus(server.id);
          if (iloStatus?.metrics) {
            serverStatusMap.value[server.id] = {
              ...serverStatusMap.value[server.id],
              powerState: iloStatus.metrics.powerState || null,
              cpuUsage: iloStatus.metrics.cpuUsage || null,
              memoryUsage: iloStatus.metrics.memoryUsage || null,
              checking: false,
            };
          }
        }

        const vmsResponse = await fetchVms({
          serverId: server.id,
          includeMetrics: true,
          limit: 100,
        });
        if (vmsResponse?.items) {
          serverStatusMap.value[server.id].vmCount = vmsResponse.items.length;
          serverStatusMap.value[server.id].vms = vmsResponse.items.map(
            (vm) => ({
              id: vm.id,
              name: vm.name,
              powerState: vm.metrics?.powerState || vm.state || 'unknown',
              cpuUsage: vm.metrics?.cpuUsage,
              memoryUsage: vm.metrics?.memoryUsage,
            }),
          );
        }
      } catch (error) {
        console.error(
          `Failed to load status for server ${server.name}:`,
          error,
        );
        serverStatusMap.value[server.id].checking = false;
      }
    });

    await Promise.allSettled(statusPromises);
  } catch (error) {
    console.error('Failed to load server statuses:', error);
  } finally {
    loadingStatuses.value = false;
  }
};

const generateYamlPreview = async () => {
  // Ensure server statuses are loaded before generating YAML
  await loadServerStatuses();

  const vcenter = serverStore.list.find((s) => s.type === 'vcenter');
  const upsList = await upsStore.fetchUps();
  const ups = upsList?.items?.[0];

  let yaml = '';

  if (vcenter) {
    yaml += `vCenter:
  ip: ${vcenter.ip || '0.0.0.0'}
  user: ${vcenter.login || 'administrator@vsphere.local'}
  password: ***
  port: 443

`;
  }

  if (ups) {
    yaml += `ups:
  shutdownGrace: ${ups.grace_period_off || 60}
  restartGrace: ${ups.grace_period_on || 60}

`;
  }

  yaml += 'servers:\n';

  let vmsData = null;
  try {
    const vmsResponse = await migrationApi.getVmsForMigration();
    vmsData = vmsResponse.data;
  } catch (error) {
    console.error('Failed to fetch VMs for migration:', error);
  }

  for (const server of esxiServers.value) {
    const destination = destinationMap.value[server.id];
    if (!destination) continue;

    yaml += `  - server:
      host:
        name: ${server.name}
        moid: ${server.vmwareHostMoid}${destination === 'shutdown-only' ? ' # SHUTDOWN ONLY - No migration' : ''}`;

    if (server.ilo) {
      yaml += `
        ilo:
          ip: ${server.ilo.ip}
          user: ${server.ilo.login}
          password: ***`;
    }

    if (destination && destination !== 'shutdown-only') {
      const destServer = esxiServers.value.find((s) => s.id === destination);
      if (destServer) {
        yaml += `
      destination:
        name: ${destServer.name}
        moid: ${destServer.vmwareHostMoid}`;

        if (destServer.ilo) {
          yaml += `
        ilo:
          ip: ${destServer.ilo.ip}
          user: ${destServer.ilo.login}
          password: ***`;
        }
      }
    }

    const serverVmsData = vmsData?.servers.find(
      (s) => s.server.id === server.id,
    );
    const vms = serverVmsData?.vms || [];

    if (vms.length > 0) {
      yaml += `
      vmOrder:`;

      vms
        .sort((a, b) => b.priority - a.priority)
        .forEach((vm) => {
          const priorityLabel = getPriorityLabel(vm.priority);
          const vmMetrics = serverStatusMap.value[server.id]?.vms?.find(
            (v) => v.id === vm.id || v.name === vm.name,
          );
          const vmStatus = vmMetrics?.powerState || vm.state || 'unknown';
          yaml += `
        - vmMoId: ${vm.moid || vm.id}
          name: ${vm.name}
          priority: ${vm.priority} (${priorityLabel})
          status: ${vmStatus}`;

          if (vmMetrics?.cpuUsage !== undefined) {
            yaml += `
          cpuUsage: ${Math.round(vmMetrics.cpuUsage)}%`;
          }
          if (vmMetrics?.memoryUsage !== undefined) {
            yaml += `
          memoryUsage: ${Math.round(vmMetrics.memoryUsage)}%`;
          }
        });
    } else {
      yaml += `
      vmOrder: []`;
    }

    yaml += `
`;
  }

  yamlContent.value = yaml;
};

const loadDestinations = async () => {
  try {
    await serverStore.fetchServers();
    const data = await migrationStore.fetchDestinations();

    destinationMap.value = {};
    data.destinations.forEach((dest) => {
      const realServer = serverStore.list.find(
        (s) => s.name === dest.sourceServer?.name,
      );
      const sourceId = realServer?.id || dest.sourceServer?.id;

      if (!sourceId) {
        console.error(
          'Could not determine source server ID for destination:',
          dest,
        );
        return;
      }

      if (dest.destinationServer) {
        const realDestServer = serverStore.list.find(
          (s) => s.name === dest.destinationServer?.name,
        );
        const destId = realDestServer?.id || dest.destinationServer?.id;
        if (destId) {
          destinationMap.value[sourceId] = destId;
        }
      } else {
        destinationMap.value[sourceId] = 'shutdown-only';
      }
    });

    originalDestinations.value = { ...destinationMap.value };
    await generateYamlPreview();
  } catch (error) {
    console.error('Failed to load destinations:', error);
  }
};

watch(
  () => migrationStore.yamlPath,
  () => {
    generateYamlPreview();
  },
);

onMounted(async () => {
  await loadDestinations();
  if (!hasMissingVmwareMoids.value) {
    await loadServerStatuses();
  }
});

watch(
  () => esxiServers.value,
  async (newServers) => {
    if (newServers.length > 0 && !hasMissingVmwareMoids.value) {
      await loadServerStatuses();
    }
  },
  { deep: true },
);
</script>
