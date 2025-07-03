<template>
  <CommandDialog :open="isOpen" @update:open="handleOpenChange">
    <CommandInput
      v-model="query"
      :placeholder="t('command_palette.placeholder')"
    />
    <CommandList>
      <CommandEmpty>{{ t('command_palette.no_results') }}</CommandEmpty>
      
      <CommandGroup
        v-for="(actions, groupName) in groupedActions"
        :key="groupName"
        :heading="groupName"
      >
        <CommandItem
          v-for="(action, index) in actions"
          :key="action.path || action.label"
          :value="action.label"
          @select="() => handleAction(action)"
          :data-selected="getGlobalIndex({ group: groupName }, index) === selectedIndex"
        >
          <component
            :is="action.icon"
            class="mr-2 h-4 w-4"
          />
          <span>{{ t(action.label) }}</span>
          <CommandShortcut v-if="action.shortcut">
            {{ getPlatformShortcut(action.shortcut) }}
          </CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandDialog>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import { useCommandPalette } from './CommandPalette/useCommandPalette';

const { t } = useI18n();

const {
  isOpen,
  query,
  selectedIndex,
  groupedActions,
  openCommandPalette,
  closeCommandPalette,
  handleAction,
  handleKeydown,
} = useCommandPalette();

const handleOpenChange = (open: boolean) => {
  if (!open) {
    closeCommandPalette();
  }
};

const getGlobalIndex = (group: any, localIndex: number) => {
  let globalIndex = 0;
  const groups = Object.entries(groupedActions.value);
  for (const [groupName, actions] of groups) {
    if (groupName === group.group) {
      return globalIndex + localIndex;
    }
    globalIndex += actions.length;
  }
  return -1;
};

const getPlatformShortcut = (shortcut: string) => {
  const isMac = navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
  return isMac ? `⌘${shortcut}` : `Ctrl+${shortcut}`;
};

watch(isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleKeydown);
  } else {
    document.removeEventListener('keydown', handleKeydown);
  }
});

defineExpose({
  openCommandPalette,
  closeCommandPalette,
});
</script>