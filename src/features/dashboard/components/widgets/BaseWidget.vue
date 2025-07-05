<script setup lang="ts">
import { computed } from 'vue';
import type { WidgetConfig } from '../../types/widget';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  config: WidgetConfig;
  loading?: boolean;
  error?: string | null;
}>();

const emit = defineEmits<{
  refresh: [];
  settings: [];
  remove: [];
  fullscreen: [];
}>();

const { t } = useI18n();

const showHeader = computed(() => props.config.title || props.config.settings);
</script>

<template>
  <div
    class="widget-container bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-full"
  >
    <div
      v-if="showHeader"
      class="widget-header flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-neutral-700"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ config.title }}
      </h3>
      <div class="flex items-center gap-2">
        <button
          v-if="config.settings"
          @click="emit('settings')"
          class="p-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
          :title="t('dashboard.widget.settings')"
        >
          <svg
            class="w-4 h-4 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            ></path>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
          </svg>
        </button>
        <button
          @click="emit('refresh')"
          class="p-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
          :title="t('dashboard.widget.refresh')"
        >
          <svg
            class="w-4 h-4 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
        </button>
        <button
          @click="emit('fullscreen')"
          class="p-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
          :title="t('dashboard.widget.fullscreen')"
        >
          <svg
            class="w-4 h-4 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            ></path>
          </svg>
        </button>
        <button
          @click="emit('remove')"
          class="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
          :title="t('dashboard.widget.remove')"
        >
          <svg
            class="w-4 h-4 text-red-500 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <div class="widget-content flex-1 p-4 overflow-auto">
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        ></div>
      </div>

      <div v-else-if="error" class="flex items-center justify-center h-full">
        <div class="text-center">
          <svg
            class="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {{ error }}
          </p>
        </div>
      </div>

      <slot v-else />
    </div>
  </div>
</template>

<style scoped>
.widget-container {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.widget-container:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
