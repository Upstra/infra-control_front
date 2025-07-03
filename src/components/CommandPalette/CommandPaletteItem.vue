<template>
  <button
    :class="[
      'w-full flex items-center justify-between gap-4 px-6 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors',
      isSelected &&
        'bg-primary/5 dark:bg-primary/10 border-r-2 border-primary dark:border-blue-400',
    ]"
    @click="$emit('action', action)"
  >
    <div class="flex items-center gap-3">
      <div
        class="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-700"
      >
        <component
          :is="action.icon"
          class="w-4 h-4 text-neutral-600 dark:text-neutral-400"
        />
      </div>
      <div>
        <div class="font-medium text-neutral-800 dark:text-white">
          {{ t(action.label) }}
        </div>
        <div
          v-if="action.description"
          class="text-sm text-neutral-500 dark:text-neutral-400"
        >
          {{ t(action.description) }}
        </div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <kbd
        v-if="action.shortcut"
        class="px-2 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md"
      >
        {{ action.shortcut }}
      </kbd>
      <ChevronRightIcon
        class="w-4 h-4 text-neutral-400 dark:text-neutral-500"
      />
    </div>
  </button>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ChevronRight as ChevronRightIcon } from 'lucide-vue-next';
import type { CommandAction } from './types';

interface Props {
  action: CommandAction;
  isSelected: boolean;
}

defineProps<Props>();

defineEmits<{
  action: [action: CommandAction];
}>();

const { t } = useI18n();
</script>
