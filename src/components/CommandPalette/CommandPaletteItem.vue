<template>
  <button
    :class="[
      'w-full flex items-center justify-between gap-4 px-6 py-3 text-left hover:bg-surface-sunken transition-colors',
      isSelected &&
        'bg-primary/5 border-r-2 border-primary',
    ]"
    @click="$emit('action', action)"
  >
    <div class="flex items-center gap-3">
      <div
        class="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-raised"
      >
        <component
          :is="action.icon"
          class="w-4 h-4 text-text"
        />
      </div>
      <div>
        <div class="font-medium text-text-strong">
          {{ t(action.label) }}
        </div>
        <div
          v-if="action.description"
          class="text-sm text-text-muted"
        >
          {{ t(action.description) }}
        </div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <kbd
        v-if="action.shortcut"
        class="px-2 py-1 text-xs font-medium text-text-muted bg-surface-raised border border-border rounded-md"
      >
        {{ action.shortcut }}
      </kbd>
      <ChevronRightIcon
        class="w-4 h-4 text-text-muted"
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
