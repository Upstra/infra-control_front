<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
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
          <div
            class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400"
          >
            <Clock class="w-4 h-4" />
            <span>{{ currentDate }}</span>
          </div>
        </div>
      </div>

      <div class="mb-8">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {{ t('migration.flow.title') }}
          </h2>

          <PriorityFlow />
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
      >
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {{ t('migration.control.title') }}
        </h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {{ t('migration.control.source_server') }}
            </label>
            <select
              v-model="selectedSourceServer"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">
                {{ t('migration.control.select_source') }}
              </option>
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

          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {{ t('migration.control.destination_server') }}
            </label>
            <select
              v-model="selectedDestinationServer"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">
                {{ t('migration.control.select_destination') }}
              </option>
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

      <div
        v-if="showPreview"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {{ t('migration.preview.title') }}
        </h2>

        <div class="flex items-center justify-center space-x-8 py-8">
          <div class="flex-1 max-w-xs">
            <div
              class="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow-lg"
            >
              <div class="flex items-center space-x-3">
                <Server class="w-6 h-6" />
                <div>
                  <h3 class="font-semibold">{{ sourceServerDetails?.name }}</h3>
                  <p class="text-sm opacity-90">
                    {{ sourceServerDetails?.type }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex-shrink-0">
            <div class="relative">
              <ArrowRight class="w-8 h-8 text-gray-400 dark:text-gray-500" />
              <div
                class="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
              >
                {{ t('migration.preview.arrow_label') }}
              </div>
            </div>
          </div>

          <div class="flex-1 max-w-xs">
            <div
              class="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4 shadow-lg"
            >
              <div class="flex items-center space-x-3">
                <Server class="w-6 h-6" />
                <div>
                  <h3 class="font-semibold">
                    {{ destinationServerDetails?.name }}
                  </h3>
                  <p class="text-sm opacity-90">
                    {{ destinationServerDetails?.type }}
                  </p>
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
import { Clock, Server, ArrowRight } from 'lucide-vue-next';
import { useServerStore } from '@/features/servers/store';
import { useRoomStore } from '@/features/rooms/store';
import PriorityFlow from '@/features/groups/components/PriorityFlow.vue';

const { t } = useI18n();
const serversStore = useServerStore();
const roomsStore = useRoomStore();

const currentDate = new Date().toLocaleDateString('fr-FR', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const selectedSourceServer = ref('');
const selectedDestinationServer = ref('');

const availableServers = computed(() => {
  return serversStore.list
    .filter((server) => server.type !== 'vcenter')
    .map((server) => ({
      id: server.id,
      name: server.name,
      type: server.type,
      room:
        roomsStore.list.find((room) => room.id === server.roomId)?.name ||
        'Unknown',
    }));
});

const canMigrate = computed(() => {
  return (
    selectedSourceServer.value &&
    selectedDestinationServer.value &&
    selectedSourceServer.value !== selectedDestinationServer.value
  );
});

const showPreview = computed(() => canMigrate.value);

const sourceServerDetails = computed(() => {
  return availableServers.value.find(
    (server) => server.id === selectedSourceServer.value,
  );
});

const destinationServerDetails = computed(() => {
  return availableServers.value.find(
    (server) => server.id === selectedDestinationServer.value,
  );
});

const startMigration = () => {
  // TODO: Implement migration logic
  console.log(
    'Starting migration from',
    selectedSourceServer.value,
    'to',
    selectedDestinationServer.value,
  );
};

onMounted(async () => {
  await serversStore.fetchServers();
  await roomsStore.fetchRooms();
});
</script>
