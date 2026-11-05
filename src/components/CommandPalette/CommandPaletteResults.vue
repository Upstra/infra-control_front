<template>
  <div class="max-h-96 overflow-y-auto">
    <div
      v-if="Object.keys(groupedActions).length === 0"
      class="p-8 text-center"
    >
      <div
        class="w-16 h-16 mx-auto mb-4 bg-surface-raised rounded-full flex items-center justify-center"
      >
        <SearchIcon class="w-8 h-8 text-text-muted" />
      </div>
      <p class="text-text-muted font-medium">
        {{ t('command_palette.no_results') }}
      </p>
      <p class="text-sm text-text-muted mt-1">
        {{ t('command_palette.try_different') }}
      </p>
    </div>

    <template v-for="(grouped, group) in groupedActions" :key="group">
      <div
        class="px-6 py-3 bg-surface-sunken border-b border-border"
      >
        <h3
          class="text-xs font-semibold text-text-muted uppercase tracking-wide"
        >
          {{ group }}
        </h3>
      </div>
      <div class="py-2">
        <CommandPaletteItem
          v-for="(action, index) in grouped"
          :key="action.label"
          :action="action"
          :is-selected="selectedIndex === getActionIndex(group, index)"
          @action="$emit('action', $event)"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Search as SearchIcon } from 'lucide-vue-next';
import CommandPaletteItem from './CommandPaletteItem.vue';
import type { CommandAction } from './types';

interface Props {
  groupedActions: Record<string, CommandAction[]>;
  selectedIndex: number;
}

const props = defineProps<Props>();

defineEmits<{
  action: [action: CommandAction];
}>();

const { t } = useI18n();

const getActionIndex = (group: string, index: number) => {
  let totalIndex = 0;
  for (const [groupName, actions] of Object.entries(props.groupedActions)) {
    if (groupName === group) {
      return totalIndex + index;
    }
    totalIndex += actions.length;
  }
  return totalIndex;
};
</script>
