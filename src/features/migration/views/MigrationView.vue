<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ t('migration.title') }}
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              {{ t('migration.description') }}
            </p>
          </div>
          <div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock class="w-4 h-4" />
            <span>{{ currentDate }}</span>
          </div>
        </div>
      </div>

      <!-- Migration Flow (existing from groups) -->
      <div class="mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {{ t('migration.flow.title') }}
          </h2>
          
          <!-- Vue Flow Container -->
          <div class="h-96 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <VueFlow
              :nodes="nodes"
              :edges="edges"
              :node-types="nodeTypes"
              :edge-types="edgeTypes"
              class="h-full"
              :default-viewport="{ zoom: 0.8, x: 50, y: 50 }"
              :fit-view-on-init="true"
            >
              <template #node-server="{ data }">
                <div class="bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 rounded-lg p-4 shadow-lg min-w-[200px]">
                  <div class="flex items-center space-x-3">
                    <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Server class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900 dark:text-white">{{ data.name }}</h3>
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ data.type }}</p>
                    </div>
                  </div>
                  <div class="mt-3 flex items-center justify-between">
                    <span class="text-xs px-2 py-1 rounded-full" :class="getStatusClass(data.status)">
                      {{ data.status }}
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ data.room }}</span>
                  </div>
                </div>
              </template>
            </VueFlow>
          </div>
        </div>
      </div>

      <!-- Migration Control Panel -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {{ t('migration.control.title') }}
        </h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Source Server Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('migration.control.source_server') }}
            </label>
            <select 
              v-model="selectedSourceServer"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">{{ t('migration.control.select_source') }}</option>
              <option 
                v-for="server in availableServers" 
                :key="server.id" 
                :value="server.id"
                :disabled="server.id === selectedDestinationServer"
              >
                {{ server.name }} ({{ server.type }}) - {{ server.room }}
              </option>
            </select>
          </div>

          <!-- Destination Server Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('migration.control.destination_server') }}
            </label>
            <select 
              v-model="selectedDestinationServer"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">{{ t('migration.control.select_destination') }}</option>
              <option 
                v-for="server in availableServers" 
                :key="server.id" 
                :value="server.id"
                :disabled="server.id === selectedSourceServer"
              >
                {{ server.name }} ({{ server.type }}) - {{ server.room }}
              </option>
            </select>
          </div>
        </div>

        <!-- Migration Button -->
        <div class="mt-6 flex justify-center">
          <button
            @click="startMigration"
            :disabled="!canMigrate"
            class="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
          >
            <ArrowRight class="w-5 h-5" />
            <span>{{ t('migration.control.migrate_button') }}</span>
          </button>
        </div>
      </div>

      <!-- Migration Preview (Read-only Flow) -->
      <div v-if="showPreview" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {{ t('migration.preview.title') }}
        </h2>
        
        <div class="flex items-center justify-center space-x-8 py-8">
          <!-- Source Server -->
          <div class="flex-1 max-w-xs">
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow-lg">
              <div class="flex items-center space-x-3">
                <Server class="w-6 h-6" />
                <div>
                  <h3 class="font-semibold">{{ sourceServerDetails?.name }}</h3>
                  <p class="text-sm opacity-90">{{ sourceServerDetails?.type }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Arrow -->
          <div class="flex-shrink-0">
            <div class="relative">
              <ArrowRight class="w-8 h-8 text-gray-400 dark:text-gray-500" />
              <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {{ t('migration.preview.arrow_label') }}
              </div>
            </div>
          </div>

          <!-- Destination Server -->
          <div class="flex-1 max-w-xs">
            <div class="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4 shadow-lg">
              <div class="flex items-center space-x-3">
                <Server class="w-6 h-6" />
                <div>
                  <h3 class="font-semibold">{{ destinationServerDetails?.name }}</h3>
                  <p class="text-sm opacity-90">{{ destinationServerDetails?.type }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {{ t('migration.preview.info') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { VueFlow } from '@vue-flow/core';
import { Clock, Server, ArrowRight } from 'lucide-vue-next';
import { useServerStore } from '@/features/servers/store';
import { useRoomStore } from '@/features/rooms/store';
import type { Node, Edge } from '@vue-flow/core';

const { t } = useI18n();
const serversStore = useServerStore();
const roomsStore = useRoomStore();

// Current date for header
const currentDate = new Date().toLocaleDateString('fr-FR', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// Migration state
const selectedSourceServer = ref('');
const selectedDestinationServer = ref('');

// Vue Flow setup (existing flow from groups)
const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);
const nodeTypes = ref({
  server: 'server'
});
const edgeTypes = ref({});

// Available servers for selection
const availableServers = computed(() => {
  return serversStore.list.map(server => ({
    id: server.id,
    name: server.name,
    type: server.type,
    room: roomsStore.list.find(room => room.id === server.roomId)?.name || 'Unknown'
  }));
});

// Check if migration can be performed
const canMigrate = computed(() => {
  return selectedSourceServer.value && 
         selectedDestinationServer.value && 
         selectedSourceServer.value !== selectedDestinationServer.value;
});

// Show preview when both servers are selected
const showPreview = computed(() => canMigrate.value);

// Get server details for preview
const sourceServerDetails = computed(() => {
  return availableServers.value.find(server => server.id === selectedSourceServer.value);
});

const destinationServerDetails = computed(() => {
  return availableServers.value.find(server => server.id === selectedDestinationServer.value);
});

// Initialize flow with sample data
const initializeFlow = () => {
  nodes.value = [
    {
      id: '1',
      type: 'server',
      position: { x: 100, y: 100 },
      data: {
        name: 'Server Example 1',
        type: 'ESXi',
        status: 'online',
        room: 'Room A'
      }
    },
    {
      id: '2',
      type: 'server',
      position: { x: 400, y: 100 },
      data: {
        name: 'Server Example 2',
        type: 'vCenter',
        status: 'online',
        room: 'Room B'
      }
    }
  ];

  edges.value = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'default',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 }
    }
  ];
};

// Get status class for server nodes
const getStatusClass = (status: string) => {
  switch (status) {
    case 'online':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    case 'offline':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    case 'maintenance':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    default:
      return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
  }
};

// Start migration process
const startMigration = () => {
  // TODO: Implement migration logic
  console.log('Starting migration from', selectedSourceServer.value, 'to', selectedDestinationServer.value);
  // This would typically call an API to start the migration process
};

onMounted(async () => {
  // Load servers and rooms data
  await serversStore.fetchList();
  await roomsStore.fetchList();
  
  // Initialize the flow diagram
  initializeFlow();
});
</script>

<style scoped>
/* Custom styles for Vue Flow */
:deep(.vue-flow) {
  background: rgb(248, 250, 252);
}

:deep(.dark .vue-flow) {
  background: rgb(17, 24, 39);
}

:deep(.vue-flow__node) {
  border-radius: 8px;
}

:deep(.vue-flow__edge) {
  stroke-width: 2px;
}

:deep(.vue-flow__edge.animated) {
  animation: dash 20s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -1000;
  }
}
</style>