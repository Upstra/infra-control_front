<template>
  <div class="priority-flow-container">
    <div v-if="loading" class="flex justify-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
    </div>

    <div
      v-else-if="error"
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400"
    >
      {{ error }}
    </div>

    <div v-else class="servers-row">
      <VueDraggable
        v-model="sortedServersData"
        :animation="200"
        :delay="100"
        :delay-on-touch-only="true"
        handle=".drag-handle"
        ghost-class="ghost-server"
        chosen-class="chosen-server"
        drag-class="drag-server"
        @end="onServerDragEnd"
        class="flex gap-4 overflow-x-auto pb-4"
      >
        <div
          v-for="server in sortedServersData"
          :key="server.id"
          class="server-column min-w-[280px]"
        >
          <ServerCard
            :server="server"
            :vm-count="getVMsByServerId(server.id).length"
          >
            <template #drag-handle>
              <div
                class="drag-handle cursor-move p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Bars3Icon class="w-5 h-5 text-gray-500" />
              </div>
            </template>

            <VueDraggable
              :model-value="getVMsByServerId(server.id)"
              @update:model-value="
                (vms: VMWithPriority[]) => updateServerVMs(server.id, vms)
              "
              :animation="200"
              handle=".vm-drag-handle"
              ghost-class="ghost-vm"
              chosen-class="chosen-vm"
              drag-class="drag-vm"
              group="vms"
              @end="onVMDragEnd"
              class="vm-list flex flex-col gap-2"
            >
              <VmCard
                v-for="vm in getVMsByServerId(server.id)"
                :key="vm.id"
                :vm="vm"
              >
                <template #drag-handle>
                  <div
                    class="vm-drag-handle cursor-move p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <Bars3Icon class="w-4 h-4 text-gray-500" />
                  </div>
                </template>
              </VmCard>
            </VueDraggable>
          </ServerCard>
        </div>
      </VueDraggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import ServerCard from './priority/ServerCard.vue';
import VmCard from './priority/VmCard.vue';
import { usePriorityStore } from '../stores/usePriorityStore';
import { useToast } from 'vue-toast-notification';
import { Bars3Icon } from '@heroicons/vue/24/outline';
import type { ServerWithPriority, VMWithPriority } from '../types/priority';

const toast = useToast();
const priorityStore = usePriorityStore();

const loading = computed(() => priorityStore.loading);
const error = computed(() => priorityStore.error);
const getVMsByServerId = computed(() => priorityStore.getVMsByServerId);

const sortedServersData = ref<ServerWithPriority[]>([]);

const updateSortedServers = () => {
  sortedServersData.value = [...priorityStore.sortedServers];
};

const onServerDragEnd = async (event: any) => {
  const { oldIndex, newIndex } = event;

  if (oldIndex === newIndex) return;

  const movedServer = sortedServersData.value[newIndex];
  const targetServer =
    sortedServersData.value[oldIndex < newIndex ? newIndex - 1 : newIndex + 1];

  if (!movedServer || !targetServer) return;

  try {
    await priorityStore.swapServerPriorities(movedServer.id, targetServer.id);
    toast.success('Server priorities updated');
    updateSortedServers();
  } catch (err) {
    toast.error('Failed to update server priorities');
    updateSortedServers();
  }
};

const updateServerVMs = (serverId: string, vms: VMWithPriority[]) => {
  const allVMs = [...priorityStore.vms];

  allVMs.forEach((vm) => {
    if (vm.serverId === serverId) {
      const newVm = vms.find((v) => v.id === vm.id);
      if (newVm) {
        const index = allVMs.findIndex((v) => v.id === vm.id);
        allVMs[index] = { ...vm, priority: newVm.priority };
      }
    }
  });

  priorityStore.vms = allVMs;
};

const onVMDragEnd = async (event: any) => {
  const { from, to, oldIndex, newIndex } = event;

  if (from === to && oldIndex === newIndex) return;

  const fromServerId = from
    .closest('.server-column')
    ?.querySelector('[data-server-id]')
    ?.getAttribute('data-server-id');
  const toServerId = to
    .closest('.server-column')
    ?.querySelector('[data-server-id]')
    ?.getAttribute('data-server-id');

  if (fromServerId !== toServerId) {
    toast.error('VMs can only be reordered within the same server');
    await priorityStore.fetchVMs();
    return;
  }

  const serverVMs = getVMsByServerId.value(fromServerId);
  if (serverVMs.length > 1 && oldIndex !== newIndex) {
    const movedVM = serverVMs[newIndex];
    const targetVM =
      serverVMs[oldIndex < newIndex ? newIndex - 1 : newIndex + 1];

    if (movedVM && targetVM) {
      try {
        await priorityStore.swapVMPriorities(movedVM.id, targetVM.id);
        toast.success('VM priorities updated');
      } catch (err) {
        toast.error('Failed to update VM priorities');
        await priorityStore.fetchVMs();
      }
    }
  }
};

onMounted(async () => {
  await priorityStore.fetchAllData();
  updateSortedServers();

  priorityStore.$subscribe(() => {
    updateSortedServers();
  });
});
</script>

<style scoped>
.priority-flow-container {
  padding: 1rem;
}

.servers-row {
  overflow-x: auto;
}

.server-column {
  flex-shrink: 0;
}

.vm-list {
  min-height: 50px;
}

.ghost-server {
  opacity: 0.5;
  background: #f3f4f6;
  border: 2px dashed #9ca3af;
}

.chosen-server {
  opacity: 0.8;
}

.drag-server {
  transform: rotate(5deg);
  cursor: move;
}

.ghost-vm {
  opacity: 0.5;
  background: #e5e7eb;
  border: 2px dashed #6b7280;
}

.chosen-vm {
  opacity: 0.8;
}

.drag-vm {
  transform: rotate(3deg);
  cursor: move;
}
</style>
