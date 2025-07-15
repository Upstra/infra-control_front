<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
  >
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        {{ t('migration.destinations.title') }}
      </h2>
      <button
        v-if="yamlPath"
        @click="showYamlPreview = !showYamlPreview"
        class="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
      >
        <FileCode class="w-4 h-4" />
        {{ t('migration.destinations.preview_yaml') }}
      </button>
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
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ getRoomName(server.roomId) || t('migration.destinations.no_room') }}
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
              {{ getRoomName(dest.roomId) || t('migration.destinations.no_room') }}
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
              class="text-sm font-mono bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto"
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
import { Server, ArrowRight, X, Save, FileCode } from 'lucide-vue-next';
import { useServerStore } from '@/features/servers/store';
import { useRoomStore } from '@/features/rooms/store';
import { useUpsStore } from '@/features/ups/store';
import { useMigrationStore } from '../store';
import { useToast } from '@/shared/composables/useToast';

const { t } = useI18n();
const { showToast } = useToast();
const serverStore = useServerStore();
const migrationStore = useMigrationStore();
const roomsStore = useRoomStore();
const upsStore = useUpsStore();

const destinationMap = ref<Record<string, string>>({});
const originalDestinations = ref<Record<string, string>>({});
const hasChanges = ref(false);
const isSaving = ref(false);
const showYamlPreview = ref(false);
const yamlContent = ref('');

const isLoading = computed(
  () => serverStore.isLoading || migrationStore.isLoading,
);
const error = computed(() => migrationStore.error);
const yamlPath = computed(() => migrationStore.yamlPath);

const esxiServers = computed(() =>
  serverStore.list.filter(
    (server) => server.type === 'esxi',
  ),
);

const getAvailableDestinations = (sourceId: string) => {
  return esxiServers.value.filter((server) => server.id !== sourceId);
};

const updateHasChanges = () => {
  hasChanges.value =
    JSON.stringify(destinationMap.value) !==
    JSON.stringify(originalDestinations.value);
};

const removeDestination = (serverId: string) => {
  destinationMap.value[serverId] = '';
  updateHasChanges();
};

const resetDestinations = () => {
  destinationMap.value = { ...originalDestinations.value };
  hasChanges.value = false;
};

const saveDestinations = async () => {
  try {
    isSaving.value = true;

    // Only send servers that have a destination configured
    const destinations = Object.entries(destinationMap.value)
      .filter(([_, destId]) => destId !== '')
      .map(([sourceServerId, destId]) => {
        // For shutdown-only, don't send destinationServerId
        if (destId === 'shutdown-only') {
          return { sourceServerId };
        }
        return {
          sourceServerId,
          destinationServerId: destId,
        };
      });

    await migrationStore.configureDestinations({ destinations });

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
  const room = roomsStore.list.find(r => r.id === roomId);
  return room?.name || '';
};

const generateYamlPreview = async () => {
  const vcenter = serverStore.list.find((s) => s.type === 'vcenter');
  const upsList = await upsStore.fetchUps();
  const ups = upsList?.items?.[0]; // Get first UPS

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

  // Only include servers that have a destination or shutdown-only configured
  for (const server of esxiServers.value) {
    const destination = destinationMap.value[server.id];
    if (!destination) continue; // Skip servers with no action
    
    yaml += `  - server:
      host:
        name: ${server.name}
        moid: host-${server.id}`; // Use server ID as placeholder for moid

    if (server.ilo) {
      yaml += `
        ilo:
          ip: ${server.ilo.ip}
          user: ${server.ilo.login}
          password: ***`;
    }

    // Only add destination if it's not shutdown-only
    if (destination !== 'shutdown-only') {
      const destServer = esxiServers.value.find((s) => s.id === destination);
      if (destServer) {
        yaml += `
      destination:
        name: ${destServer.name}
        moid: host-${destServer.id}`; // Use server ID as placeholder for moid

        if (destServer.ilo) {
          yaml += `
        ilo:
          ip: ${destServer.ilo.ip}
          user: ${destServer.ilo.login}
          password: ***`;
        }
      }
    }

    yaml += `
      vmOrder: []
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
      if (dest.destinationServer) {
        destinationMap.value[dest.sourceServer.id] = dest.destinationServer.id;
      } else {
        // Server configured for shutdown only
        destinationMap.value[dest.sourceServer.id] = 'shutdown-only';
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

onMounted(() => {
  loadDestinations();
});
</script>
