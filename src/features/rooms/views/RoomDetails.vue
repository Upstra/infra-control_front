<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  BuildingOffice2Icon,
  ServerIcon,
  BoltIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline';
import { roomApi } from '../api';
import type { RoomResponseDto } from '../types';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const room = ref<RoomResponseDto | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    room.value = await roomApi.fetchRoomById(route.params.id as string);
  } catch {
    error.value = t('common.error_loading', 'Impossible de charger la salle');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <button
      class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition-colors"
      @click="router.back()"
    >
      <ArrowLeftIcon class="w-4 h-4" />
      {{ t('common.back', 'Retour') }}
    </button>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
    </div>

    <div v-else-if="error" class="flex items-center gap-3 text-red-500 py-10">
      <ExclamationTriangleIcon class="w-6 h-6" />
      <span>{{ error }}</span>
    </div>

    <template v-else-if="room">
      <div class="flex items-center gap-3 mb-8">
        <BuildingOffice2Icon class="w-8 h-8 text-blue-500" />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ room.name }}</h1>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Serveurs -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
          <div class="flex items-center gap-2 mb-4">
            <ServerIcon class="w-5 h-5 text-gray-500" />
            <h2 class="font-semibold text-gray-700 dark:text-gray-200">
              {{ t('rooms.servers', 'Serveurs') }}
              <span class="ml-1 text-sm text-gray-400">({{ room.servers?.length ?? 0 }})</span>
            </h2>
          </div>
          <ul v-if="room.servers?.length" class="divide-y divide-gray-100 dark:divide-gray-700">
            <li
              v-for="server in room.servers"
              :key="server.id"
              class="py-2 flex items-center justify-between"
            >
              <span class="text-sm text-gray-800 dark:text-gray-100 font-medium">{{ server.name }}</span>
              <span class="text-xs text-gray-400">{{ server.ip }}</span>
            </li>
          </ul>
          <p v-else class="text-sm text-gray-400">{{ t('rooms.no_servers', 'Aucun serveur') }}</p>
        </div>

        <!-- UPS -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
          <div class="flex items-center gap-2 mb-4">
            <BoltIcon class="w-5 h-5 text-yellow-500" />
            <h2 class="font-semibold text-gray-700 dark:text-gray-200">
              {{ t('rooms.ups', 'Onduleurs') }}
              <span class="ml-1 text-sm text-gray-400">({{ room.ups?.length ?? 0 }})</span>
            </h2>
          </div>
          <ul v-if="room.ups?.length" class="divide-y divide-gray-100 dark:divide-gray-700">
            <li
              v-for="ups in room.ups"
              :key="ups.id"
              class="py-2 flex items-center justify-between"
            >
              <span class="text-sm text-gray-800 dark:text-gray-100 font-medium">{{ ups.name }}</span>
              <span class="text-xs text-gray-400">{{ ups.ip }}</span>
            </li>
          </ul>
          <p v-else class="text-sm text-gray-400">{{ t('rooms.no_ups', 'Aucun onduleur') }}</p>
        </div>
      </div>
    </template>
  </div>
</template>
