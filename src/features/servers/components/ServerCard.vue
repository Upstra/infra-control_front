<script setup lang="ts">
import { computed } from 'vue';
import type { Server } from '../types';
import { useI18n } from 'vue-i18n';
import { CpuChipIcon, CloudIcon } from '@heroicons/vue/24/outline';

interface Props {
  server: Server;
  roomName?: string;
  upsName?: string;
  groupName?: string;
}

const props = defineProps<Props>();
const { t } = useI18n();

const isServerActive = computed(() => {
  if (props.server.metrics?.powerState) {
    return (
      props.server.metrics.powerState === 'poweredOn' ||
      props.server.metrics.powerState === 'On'
    );
  }
  return props.server.state === 'UP';
});
</script>

<template>
  <div
    class="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group"
  >
    <div class="p-5 space-y-4">
      <div class="flex justify-between items-start">
        <div class="flex items-start space-x-3">
          <div
            :class="[
              'p-2 rounded-lg',
              server.type === 'vcenter' || server.type === 'esxi'
                ? 'bg-blue-100 dark:bg-blue-900/30'
                : 'bg-purple-100 dark:bg-purple-900/30',
            ]"
          >
            <component
              :is="server.type === 'vcenter' ? CpuChipIcon : CloudIcon"
              :class="[
                'h-5 w-5',
                server.type === 'vcenter' || server.type === 'esxi'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-purple-600 dark:text-purple-400',
              ]"
            />
          </div>
          <div>
            <h3
              class="text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            >
              {{ server.name }}
            </h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {{ server.ip }}
            </p>
          </div>
        </div>
        <span
          v-if="server.type !== 'vcenter'"
          :class="[
            'px-2.5 py-1 text-xs font-semibold rounded-full',
            isServerActive
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
          ]"
        >
          {{ isServerActive ? t('servers.active') : t('servers.inactive') }}
        </span>
      </div>
      <div
        class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-neutral-700"
      >
        <div class="flex items-center space-x-4 text-xs">
          <div
            v-if="server.type !== 'vcenter'"
            class="flex items-center space-x-1"
          >
            <span class="text-slate-500 dark:text-slate-400"
              >{{ t('servers.priority') }}:</span
            >
            <span class="font-medium text-slate-700 dark:text-slate-300">{{
              server.priority
            }}</span>
          </div>
          <div class="flex items-center space-x-1">
            <span class="text-slate-500 dark:text-slate-400"
              >{{ t('servers.type') }}:</span
            >
            <span class="font-medium text-slate-700 dark:text-slate-300">
              {{
                server.type === 'vcenter'
                  ? t('servers.vcenter')
                  : t('servers.esxi')
              }}
            </span>
          </div>
        </div>
      </div>

      <div
        v-if="server.ilo"
        class="mt-3 px-3 py-2 bg-slate-50 dark:bg-neutral-700/50 rounded-lg"
      >
        <div
          class="flex items-center text-xs text-slate-600 dark:text-slate-400"
        >
          <div
            class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"
          ></div>
          <span>{{ t('servers.ilo_configured') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
