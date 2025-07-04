<template>
  <div class="space-y-4">
    <!-- Servers Section (for SERVER groups) -->
    <div v-if="groupType === 'SERVER'">
      <div v-if="loadingServers" class="flex items-center justify-center py-4">
        <div
          class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
        ></div>
        <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {{ $t('groups.form.loadingServers') }}
        </span>
      </div>

      <div
        v-else-if="availableServers.length === 0"
        class="text-sm text-gray-500 dark:text-gray-400 text-center py-4"
      >
        {{ $t('groups.form.noServersAvailable') }}
      </div>

      <div v-else class="space-y-2 max-h-60 overflow-y-auto">
        <label
          v-for="server in availableServers"
          :key="server.id"
          class="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          :class="{
            'bg-gray-50 dark:bg-gray-800': selectedServerIds.includes(
              server.id,
            ),
          }"
        >
          <input
            type="checkbox"
            :value="server.id"
            v-model="selectedServerIds"
            class="h-4 w-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
          />
          <div class="ml-3 flex-1">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ server.name }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ server.ip }} • {{ server.state }}
            </div>
          </div>
          <div
            v-if="server.groupId && server.groupId !== excludeGroupId"
            class="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded"
          >
            {{ $t('groups.form.alreadyAssigned') }}
          </div>
        </label>
      </div>

      <div
        v-if="selectedServerIds.length > 0"
        class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
      >
        <div class="text-sm text-blue-800 dark:text-blue-200">
          {{
            $t('groups.form.serversSelected', {
              count: selectedServerIds.length,
            })
          }}
        </div>
      </div>
    </div>

    <!-- VMs Section (for VM groups) -->
    <div v-if="groupType === 'VM'">
      <div v-if="loadingVms" class="flex items-center justify-center py-4">
        <div
          class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
        ></div>
        <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {{ $t('groups.form.loadingVms') }}
        </span>
      </div>

      <div
        v-else-if="availableVms.length === 0"
        class="text-sm text-gray-500 dark:text-gray-400 text-center py-4"
      >
        {{ $t('groups.form.noVmsAvailable') }}
      </div>

      <div v-else class="space-y-2 max-h-60 overflow-y-auto">
        <label
          v-for="vm in availableVms"
          :key="vm.id"
          class="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
          :class="{
            'bg-gray-50 dark:bg-gray-800': selectedVmIds.includes(vm.id),
          }"
        >
          <input
            type="checkbox"
            :value="vm.id"
            v-model="selectedVmIds"
            class="h-4 w-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
          />
          <div class="ml-3 flex-1">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ vm.name }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ vm.state || $t('vms.state.unknown') }}
            </div>
          </div>
          <div
            v-if="vm.groupId && vm.groupId !== excludeGroupId"
            class="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded"
          >
            {{ $t('groups.form.alreadyAssigned') }}
          </div>
        </label>
      </div>

      <div
        v-if="selectedVmIds.length > 0"
        class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
      >
        <div class="text-sm text-blue-800 dark:text-blue-200">
          {{ $t('groups.form.vmsSelected', { count: selectedVmIds.length }) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useServerStore } from '@/features/servers/store';
import { fetchUvms } from '@/features/vms/api';
import type { Server } from '@/features/servers/types';
import type { GroupType } from '../types';

interface VM {
  id: string;
  name: string;
  state?: string;
  groupId?: string | null;
}

interface Props {
  groupType: GroupType;
  initialServerIds?: string[];
  initialVmIds?: string[];
  excludeGroupId?: string; // Pour exclure le groupe en cours d'édition
}

const props = withDefaults(defineProps<Props>(), {
  initialServerIds: () => [],
  initialVmIds: () => [],
});

const emit = defineEmits<{
  'update:serverIds': [ids: string[]];
  'update:vmIds': [ids: string[]];
}>();

const serverStore = useServerStore();

// State
const selectedServerIds = ref<string[]>([...props.initialServerIds]);
const selectedVmIds = ref<string[]>([...props.initialVmIds]);
const loadingServers = ref(false);
const loadingVms = ref(false);
const vms = ref<VM[]>([]);

// Computed
const availableServers = computed(() => {
  return serverStore.list.filter((server: Server) => {
    // Inclure les serveurs non assignés ou assignés au groupe en cours d'édition
    return !server.groupId || server.groupId === props.excludeGroupId;
  });
});

const availableVms = computed(() => {
  return vms.value.filter((vm: VM) => {
    // Inclure les VMs non assignées ou assignées au groupe en cours d'édition
    return !vm.groupId || vm.groupId === props.excludeGroupId;
  });
});

// Watchers
watch(
  selectedServerIds,
  (newIds) => {
    emit('update:serverIds', newIds);
  },
  { deep: true },
);

watch(
  selectedVmIds,
  (newIds) => {
    emit('update:vmIds', newIds);
  },
  { deep: true },
);

watch(
  () => props.initialServerIds,
  (newIds) => {
    selectedServerIds.value = [...newIds];
  },
);

watch(
  () => props.initialVmIds,
  (newIds) => {
    selectedVmIds.value = [...newIds];
  },
);

// Methods
const loadServers = async () => {
  if (props.groupType !== 'SERVER') return;

  loadingServers.value = true;
  try {
    await serverStore.fetchServers();
  } catch (error) {
    console.error('Error loading servers:', error);
  } finally {
    loadingServers.value = false;
  }
};

const loadVms = async () => {
  if (props.groupType !== 'VM') return;

  loadingVms.value = true;
  try {
    const response = await fetchUvms();
    vms.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error loading VMs:', error);
    vms.value = [];
  } finally {
    loadingVms.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadServers();
  loadVms();
});
</script>
