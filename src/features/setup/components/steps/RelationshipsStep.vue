<template>
  <div class="flex flex-col min-h-[70vh] px-4 py-10">
    <div class="mb-8 text-center">
      <h2 class="text-2xl md:text-3xl font-bold text-neutral-darker dark:text-white tracking-tight">
        {{ t('setup.relationships.title') }}
      </h2>
      <p class="mt-2 text-base md:text-lg text-neutral-dark dark:text-neutral-300 max-w-lg mx-auto">
        {{ t('setup.relationships.description') }}
      </p>
    </div>

    <div class="max-w-4xl mx-auto w-full">
      <div v-if="hasUnassignedServers" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <div class="flex">
          <AlertCircle :size="20" class="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div class="ml-3">
            <p class="text-sm text-yellow-700 dark:text-yellow-300">
              {{ t('setup.relationships.unassigned_warning', { count: unassignedServers.length }) }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {{ t('setup.relationships.rooms_section') }}
          </h3>
          <div class="space-y-4">
            <div
              v-for="room in setupStore.resources.rooms"
              :key="room.id"
              class="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
            >
              <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Building2 :size="18" class="mr-2 text-indigo-600" />
                {{ room.name }}
              </h4>
              
              <div class="space-y-3">
                <div>
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ t('setup.relationships.ups_in_room') }}
                  </p>
                  <div v-if="getUpsInRoom(room.id || room.tempId).length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic">
                    {{ t('setup.relationships.no_ups') }}
                  </div>
                  <div v-else class="space-y-1">
                    <div
                      v-for="ups in getUpsInRoom(room.id || room.tempId)"
                      :key="ups.id || ups.tempId"
                      class="flex items-center text-sm"
                    >
                      <Zap :size="14" class="mr-2 text-yellow-500" />
                      <span class="text-gray-700 dark:text-gray-300">{{ ups.name }}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ t('setup.relationships.servers_in_room') }}
                  </p>
                  <div v-if="getServersInRoom(room.id || room.tempId).length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic">
                    {{ t('setup.relationships.no_servers') }}
                  </div>
                  <div v-else class="space-y-1">
                    <div
                      v-for="server in getServersInRoom(room.id || room.tempId)"
                      :key="server.id || server.tempId"
                      class="flex items-center text-sm"
                    >
                      <Server :size="14" class="mr-2 text-green-500" />
                      <span class="text-gray-700 dark:text-gray-300">{{ server.name }}</span>
                      <span v-if="server.upsId" class="ml-2 text-xs text-gray-500">
                        ({{ getUpsName(server.upsId) }})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {{ t('setup.relationships.visual_overview') }}
          </h3>
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
            <div class="text-center">
              <Network :size="64" class="text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500 dark:text-gray-400">
                {{ t('setup.relationships.visual_placeholder') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-between">
        <button
          @click="handleBack"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ChevronLeft :size="16" class="mr-2" />
          {{ t('common.back') }}
        </button>

        <button
          @click="handleContinue"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {{ t('setup.relationships.continue_button') }}
          <ChevronRight :size="20" class="ml-2" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetupStore } from '../../store';
import { Building2, Server, Zap, AlertCircle, Network, ChevronLeft, ChevronRight } from 'lucide-vue-next';

const setupStore = useSetupStore();
const { t } = useI18n();

const getUpsInRoom = (roomId: string | undefined) => {
  if (!roomId) return [];
  return setupStore.resources.upsList.filter((ups: any) => ups.roomId === roomId);
};

const getServersInRoom = (roomId: string | undefined) => {
  if (!roomId) return [];
  return setupStore.resources.servers.filter((server: any) => server.roomId === roomId);
};

const getUpsName = (upsId: string) => {
  const ups = setupStore.resources.upsList.find((u: any) => u.id === upsId);
  return ups?.name || t('setup.relationships.unknown_ups');
};

const unassignedServers = computed(() => {
  return setupStore.resources.servers.filter((server: any) => !server.roomId);
});

const hasUnassignedServers = computed(() => unassignedServers.value.length > 0);

const handleBack = async () => {
  await setupStore.goToPrevStep();
};

const handleContinue = async () => {
  await setupStore.goToNextStep();
};
</script>