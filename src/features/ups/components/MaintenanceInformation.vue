<script setup lang="ts">
import {
  MapPinIcon,
  CalendarDaysIcon,
  WrenchIcon,
} from '@heroicons/vue/24/outline';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

interface Props {
  ups: {
    roomId: string;
    roomName?: string;
  };
  upsMetrics: {
    lastSelfTest: string;
    nextSelfTest: string;
  };
}

defineProps<Props>();
const { t } = useI18n();

const formatTestDate = (dateString: string) => {
  if (!dateString || dateString === 'N/A') return dateString;
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('default', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};
</script>

<template>
  <div class="space-y-6">
    <h3
      class="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2"
    >
      <WrenchIcon class="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      <span>{{ t('ups.maintenance_info') }}</span>
    </h3>

    <div
      class="bg-slate-50 dark:bg-neutral-900 rounded-xl p-5 space-y-4 border border-slate-200 dark:border-neutral-700"
    >
      <div class="space-y-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3">
            <MapPinIcon
              class="h-5 w-5 text-slate-400 dark:text-slate-500 mt-0.5"
            />
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                {{ t('ups.room') }}
              </p>
              <router-link
                :to="`/rooms/${ups.roomId}`"
                class="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              >
                {{ ups.roomName || ups.roomId }}
              </router-link>
            </div>
          </div>
        </div>

        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3">
            <CalendarDaysIcon
              class="h-5 w-5 text-slate-400 dark:text-slate-500 mt-0.5"
            />
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                {{ t('ups.last_self_test') }}
              </p>
              <p class="text-sm font-semibold text-slate-900 dark:text-white">
                {{ formatTestDate(upsMetrics.lastSelfTest) }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3">
            <CalendarDaysIcon
              class="h-5 w-5 text-slate-400 dark:text-slate-500 mt-0.5"
            />
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
                {{ t('ups.next_self_test') }}
              </p>
              <p class="text-sm font-semibold text-slate-900 dark:text-white">
                {{ formatTestDate(upsMetrics.nextSelfTest) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-200 dark:border-neutral-700">
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500 dark:text-slate-500">
            {{ t('ups.maintenance_status') }}
          </span>
          <span
            class="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center"
          >
            <div class="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></div>
            {{ t('ups.up_to_date') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
