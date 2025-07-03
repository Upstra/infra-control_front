<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Component } from 'vue';

interface TimelineItem {
  id: number;
  time: string;
  message: string;
  type: string;
  icon: Component;
}

interface Props {
  timeline: TimelineItem[];
}

defineProps<Props>();

const { t } = useI18n();
</script>

<template>
  <div class="space-y-6">
    <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
      {{ t('servers.history') }}
    </h3>

    <div class="space-y-4">
      <div
        v-for="item in timeline"
        :key="item.id"
        class="flex items-start space-x-4 p-4 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl"
      >
        <div
          :class="[
            'p-2 rounded-lg',
            item.type === 'success'
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
              : item.type === 'warning'
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                : item.type === 'error'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
          ]"
        >
          <component :is="item.icon" class="h-4 w-4" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-slate-900 dark:text-white">
            {{ item.message }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {{ item.time }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
