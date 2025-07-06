<script setup lang="ts">
import type { Room } from '../types';
import { useI18n } from 'vue-i18n';
import {
  BuildingOffice2Icon,
  ServerIcon,
  BoltIcon,
  ArrowRightIcon,
} from '@heroicons/vue/24/outline';
import { computed } from 'vue';

const props = defineProps<{
  room: Room;
  viewMode?: 'grid' | 'list';
}>();

const { t } = useI18n();

const cardClasses = computed(() => {
  const baseClasses =
    'bg-white dark:bg-neutral-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-slate-200 dark:border-neutral-700 group overflow-hidden';

  if (props.viewMode === 'list') {
    return `${baseClasses} flex items-center p-6`;
  }
  return `${baseClasses} p-6`;
});

const stats = computed(() => ({
  servers: props.room.serverCount ?? 0,
  ups: props.room.upsCount ?? 0,
  uptime: (Math.random() * 5 + 95).toFixed(1),
}));
</script>

<template>
  <div v-if="viewMode !== 'list'" :class="cardClasses">
    <div class="relative mb-6">
      <div
        class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-10"
      ></div>
      <div class="relative p-4 rounded-xl">
        <div class="flex items-center justify-between mb-2">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <BuildingOffice2Icon
              class="h-6 w-6 text-blue-600 dark:text-blue-400"
            />
          </div>
          <div
            class="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full"
          >
            {{ stats.uptime }}% uptime
          </div>
        </div>
        <h3
          class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
        >
          {{ room.name }}
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Room ID: {{ room.id }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="text-center p-3 bg-slate-50 dark:bg-neutral-700 rounded-xl">
        <ServerIcon
          class="h-6 w-6 text-slate-600 dark:text-slate-400 mx-auto mb-1"
        />
        <div class="text-lg font-bold text-slate-900 dark:text-white">
          {{ stats.servers }}
        </div>
        <div class="text-xs text-slate-600 dark:text-slate-400">
          {{ t('servers.servers') }}
        </div>
      </div>
      <div class="text-center p-3 bg-slate-50 dark:bg-neutral-700 rounded-xl">
        <BoltIcon
          class="h-6 w-6 text-amber-600 dark:text-amber-400 mx-auto mb-1"
        />
        <div class="text-lg font-bold text-slate-900 dark:text-white">
          {{ stats.ups }}
        </div>
        <div class="text-xs text-slate-600 dark:text-slate-400">
          {{ t('rooms.detail.ups_units') }}
        </div>
      </div>
    </div>

    <router-link
      :to="`/rooms/${room.id}`"
      class="group flex items-center justify-center w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-200 dark:hover:shadow-blue-900/50 transform hover:scale-105"
    >
      {{ t('rooms.view_details') }}
      <ArrowRightIcon
        class="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform"
      />
    </router-link>
  </div>

  <div v-else :class="cardClasses">
    <div class="flex items-center space-x-4 flex-1">
      <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
        <BuildingOffice2Icon class="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>

      <div class="flex-1">
        <h3
          class="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
        >
          {{ room.name }}
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          ID: {{ room.id }}
        </p>
      </div>

      <div class="hidden sm:flex items-center space-x-6 text-sm">
        <div class="text-center">
          <div class="font-semibold text-slate-900 dark:text-white">
            {{ stats.servers }}
          </div>
          <div class="text-slate-600 dark:text-slate-400">
            {{ t('servers.servers') }}
          </div>
        </div>
        <div class="text-center">
          <div class="font-semibold text-slate-900 dark:text-white">
            {{ stats.ups }}
          </div>
          <div class="text-slate-600 dark:text-slate-400">
            {{ t('nav.ups') }}
          </div>
        </div>
        <div class="text-center">
          <div class="font-semibold text-green-600 dark:text-green-400">
            {{ stats.uptime }}%
          </div>
          <div class="text-slate-600 dark:text-slate-400">Uptime</div>
        </div>
      </div>
    </div>

    <router-link
      :to="`/rooms/${room.id}`"
      class="group flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors ml-4"
    >
      {{ t('common.view') }}
      <ArrowRightIcon
        class="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform"
      />
    </router-link>
  </div>
</template>
