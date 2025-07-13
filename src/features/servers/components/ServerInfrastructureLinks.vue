<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import {
  MapPinIcon,
  BoltIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  ServerIcon,
} from '@heroicons/vue/24/outline';
import type { Server } from '../types';

interface Props {
  server: Server;
  roomName?: string;
  upsName?: string;
  groupName?: string;
}

defineProps<Props>();

const { t } = useI18n();
</script>

<template>
  <div class="space-y-6">
    <h3
      class="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2"
    >
      <MapPinIcon class="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      <span>{{ t('servers.infrastructure_links') }}</span>
    </h3>

    <div
      class="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 p-5 space-y-4"
    >
      <div class="space-y-3">
        <div class="flex items-start space-x-3">
          <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <BuildingOffice2Icon
              class="h-5 w-5 text-purple-600 dark:text-purple-400"
            />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              {{ t('servers.room') }}
            </p>
            <router-link
              :to="`/rooms/${server.roomId}`"
              class="text-base font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {{ roomName || server.roomId }}
            </router-link>
          </div>
        </div>

        <div v-if="server.groupId" class="flex items-start space-x-3">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <UserGroupIcon class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              {{ t('servers.group') }}
            </p>
            <router-link
              :to="`/groups/${server.groupId}`"
              class="text-base font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {{ groupName || server.groupId }}
            </router-link>
          </div>
        </div>

        <div v-if="server.upsId" class="flex items-start space-x-3">
          <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <BoltIcon class="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              {{ t('servers.ups') }}
            </p>
            <router-link
              :to="`/ups/${server.upsId}`"
              class="text-base font-semibold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              {{ upsName || server.upsId }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-if="server.ilo" class="space-y-4">
      <h4
        class="text-md font-semibold text-slate-900 dark:text-white flex items-center space-x-2"
      >
        <ServerIcon class="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span>{{ t('servers.ilo_section') }}</span>
      </h4>

      <div
        class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p class="font-medium text-blue-800 dark:text-blue-300 mb-1">
              {{ t('servers.ilo_name') }}
            </p>
            <p class="text-blue-900 dark:text-blue-200">
              {{ server.ilo.name }}
            </p>
          </div>
          <div>
            <p class="font-medium text-blue-800 dark:text-blue-300 mb-1">
              {{ t('servers.ilo_ip') }}
            </p>
            <p class="text-blue-900 dark:text-blue-200 font-mono">
              {{ server.ilo.ip }}
            </p>
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
          <p class="text-xs text-blue-700 dark:text-blue-300">
            {{ t('servers.ilo_management_info') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
