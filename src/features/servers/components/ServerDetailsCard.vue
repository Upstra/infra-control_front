<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ServerIcon } from '@heroicons/vue/24/outline';
import type { Server } from '../types';

interface Props {
  server: Server;
}

defineProps<Props>();

const { t } = useI18n();
</script>

<template>
  <div class="space-y-6">
    <h3
      class="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2"
    >
      <ServerIcon class="h-5 w-5 text-blue-600 dark:text-blue-400" />
      <span>{{ t('servers.server_details') }}</span>
    </h3>

    <div class="bg-slate-50 dark:bg-neutral-700 rounded-xl p-4 space-y-3">
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="space-y-2">
          <p>
            <span class="font-medium text-slate-600 dark:text-slate-400"
              >{{ t('servers.ip') }}:</span
            >
            <span class="text-slate-900 dark:text-white">{{ server.ip }}</span>
          </p>
          <p>
            <span class="font-medium text-slate-600 dark:text-slate-400"
              >{{ t('servers.type') }}:</span
            >
            <span class="text-slate-900 dark:text-white">{{ server.type }}</span>
          </p>
          <p>
            <span class="font-medium text-slate-600 dark:text-slate-400"
              >{{ t('servers.priority') }}:</span
            >
            <span class="text-slate-900 dark:text-white">{{ server.priority }}</span>
          </p>
        </div>
        <div class="space-y-2">
          <p>
            <span class="font-medium text-slate-600 dark:text-slate-400"
              >{{ t('servers.grace_on') }}:</span
            >
            <span class="text-slate-900 dark:text-white">{{ server.grace_period_on }}s</span>
          </p>
          <p>
            <span class="font-medium text-slate-600 dark:text-slate-400"
              >{{ t('servers.grace_off') }}:</span
            >
            <span class="text-slate-900 dark:text-white">{{ server.grace_period_off }}s</span>
          </p>
          <p>
            <span class="font-medium text-slate-600 dark:text-slate-400"
              >{{ t('servers.admin_url') }}:</span
            >
            <a
              :href="server.adminUrl"
              target="_blank"
              class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline ml-1"
              >{{ server.adminUrl }}</a
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
